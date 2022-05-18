import entities from 'api/entities';
import { fileFromReadStream, files, generateFileName } from 'api/files';
import { errorLog } from 'api/log';
import { EnforcedWithId } from 'api/odm';
import { permissionsContext } from 'api/permissions/permissionsContext';
import settings from 'api/settings';
import templates from 'api/templates';
import { newThesauriId } from 'api/templates/utils';
import { tenants } from 'api/tenants';
import thesauri from 'api/thesauri';
import dictionariesModel from 'api/thesauri/dictionariesModel';
import { ObjectId } from 'mongodb';
import path from 'path';
import qs from 'qs';
import request from 'shared/JSONRequest';
import { propertyTypes } from 'shared/propertyTypes';
import { ObjectIdSchema } from 'shared/types/commonTypes';
import { EntitySchema } from 'shared/types/entityType';
import { PreserveConfig } from 'shared/types/settingsType';
import { TemplateSchema } from 'shared/types/templateType';
import { preserveSyncModel } from './preserveSyncModel';

const thesauriValueId = async (thesauriId: ObjectIdSchema, valueLabel: string) => {
  const [value] = await dictionariesModel.db.aggregate([
    { $match: { _id: new ObjectId(thesauriId) } },
    { $unwind: '$values' },
    { $match: { 'values.label': valueLabel } },
    { $replaceRoot: { newRoot: '$values' } },
  ]);

  return value?.id;
};

const getSourceThesauriId = async (template: EnforcedWithId<TemplateSchema> | null) =>
  (template?.properties || []).find(
    property => property.name === 'source' && property.type === propertyTypes.select
  );

const extractSource = async (
  template: EnforcedWithId<TemplateSchema> | null,
  evidence: { [k: string]: any }
) => {
  const sourceProperty = await getSourceThesauriId(template);

  if (!sourceProperty) {
    return {};
  }

  const { hostname } = new URL(evidence.attributes.url);
  let valueId = await thesauriValueId(sourceProperty.content || '', hostname);
  const contentThesauri = await thesauri.getById(sourceProperty.content);

  if (!valueId && contentThesauri) {
    valueId = newThesauriId();
    await dictionariesModel.db.updateOne(
      { _id: sourceProperty.content },
      // @ts-ignore
      { $push: { values: { label: hostname, _id: new ObjectId(), id: valueId } } }
    );
  }

  return valueId ? { source: [{ value: valueId }] } : {};
};

const extractURL = async (
  template: EnforcedWithId<TemplateSchema> | null,
  evidence: { [k: string]: any }
) => {
  const hasURLProperty = (template?.properties || []).find(
    property => property.name === 'url' && property.type === propertyTypes.link
  );

  return hasURLProperty ? { url: [{ value: { label: '', url: evidence.attributes.url } }] } : {};
};

const saveEvidence =
  (token: string, templateId: ObjectIdSchema, host: string) =>
  async (previous: Promise<EntitySchema>, evidence: any) => {
    await previous;

    try {
      const template = await templates.getById(templateId);

      const { sharedId } = await entities.save(
        {
          title: evidence.attributes.title,
          template: templateId,
          metadata: {
            ...(await extractURL(template, evidence)),
            ...(await extractSource(template, evidence)),
          },
        },
        { language: 'en', user: {} }
      );
      await Promise.all(
        evidence.attributes.downloads.map(async (download: any) => {
          const fileName = generateFileName({ originalname: path.basename(download.path) });
          const fileStream = (
            await fetch(new URL(path.join(host, download.path)).toString(), {
              headers: { Authorization: token },
            })
          ).body as unknown as NodeJS.ReadableStream;
          if (fileStream) {
            await fileFromReadStream(fileName, fileStream);

            await files.save({
              entity: sharedId,
              type: 'attachment',
              filename: fileName,
              originalname: path.basename(download.path),
            });
          }
        })
      );
    } catch (error) {
      errorLog.error(error);
    }
  };

const preserveSync = {
  async syncAllTenants() {
    return Object.keys(tenants.tenants).reduce(async (previous, tenantName) => {
      await previous;
      return tenants.run(async () => {
        permissionsContext.setCommandContext();
        const { features } = await settings.get({}, 'features.preserve');
        if (features?.preserve) {
          await this.sync(features.preserve);
        }
      }, tenantName);
    }, Promise.resolve());
  },

  async sync(preserveConfig: PreserveConfig) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const config of preserveConfig.config) {
      const preservationSync = await preserveSyncModel.db.findOne({ token: config.token }, {});

      const queryString = qs.stringify({
        filter: {
          status: 'PROCESSED',
          ...(preservationSync ? { date: { gt: preservationSync.lastImport } } : {}),
        },
      });

      const evidences = await request.get(
        `${preserveConfig.host}/api/evidences?${queryString}`,
        {},
        {
          Authorization: config.token,
        }
      );

      await evidences.json.data.reduce(
        saveEvidence(config.token, config.template, preserveConfig.host),
        Promise.resolve()
      );

      if (evidences.json.data.length) {
        await preserveSyncModel.save({
          ...(preservationSync ? { _id: preservationSync._id } : {}),
          lastImport: evidences.json.data[evidences.json.data.length - 1].attributes.date,
          token: config.token,
        });
      }
    }
  },
};

export { preserveSync };
