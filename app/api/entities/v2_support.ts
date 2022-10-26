import { ObjectId } from 'mongodb';

import templates from 'api/templates';
import { DefaultEntitiesDataSource } from 'api/entities.v2/database/data_source_defaults';
import {
  DeleteRelationshipService,
  DenormalizationService,
} from 'api/relationships.v2/services/service_factories';
import { search } from 'api/search';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { getClient } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { objectIndex } from 'shared/data_utils/objectIndex';
import { EntitySchema } from 'shared/types/entityType';
import { MetadataSchema } from 'shared/types/commonTypes';
import { propertyTypes } from 'shared/propertyTypes';
import { TemplateSchema } from 'shared/types/templateType';

const entityTypeCheck = (
  entity: EntitySchema
): entity is EntitySchema & {
  template: ObjectId;
  sharedId: string;
  metadata: MetadataSchema;
} => !!entity.template && !!entity.sharedId && !!entity.metadata;

const performNewRelationshipQueries = async (entities: EntitySchema[]) => {
  const transactionManager = new MongoTransactionManager(getClient());
  if (!(await DefaultSettingsDataSource(transactionManager).readNewRelationshipsAllowed())) {
    return;
  }

  const templateIdToProperties = objectIndex(
    await templates.get({ _id: entities.map(e => e.template) }),
    t => t._id.toString(),
    t => t.properties.filter((prop: any) => prop.type === 'newRelationship')
  );
  const entitiesDataSource = DefaultEntitiesDataSource(transactionManager);

  await Promise.all(
    entities.filter(entityTypeCheck).map(async entity => {
      const relProperties = templateIdToProperties[entity.template.toHexString()];
      if (!relProperties) return;

      const queryedEntity = await entitiesDataSource
        .getByIds([entity.sharedId], entity.language)
        .first();

      if (queryedEntity) {
        relProperties.forEach((relProperty: any) => {
          entity.metadata[relProperty.name] = queryedEntity.metadata[relProperty.name];
        });
      }
    })
  );
  entities.forEach(entity => {
    entity.obsoleteMetadata = [];
  });
};

const deleteRelatedNewRelationships = async (sharedId: string) => {
  if (
    await DefaultSettingsDataSource(
      new MongoTransactionManager(getClient())
    ).readNewRelationshipsAllowed()
  ) {
    const service = DeleteRelationshipService(undefined);
    await service.deleteByEntity(sharedId);
  }
};

const markNewRelationshipsOfAffected = async (
  { sharedId, language }: { sharedId: string; language: string },
  index: boolean = true
) => {
  const transactionManager = new MongoTransactionManager(getClient());
  if (await DefaultSettingsDataSource(transactionManager).readNewRelationshipsAllowed()) {
    const entitiesDataSource = DefaultEntitiesDataSource(transactionManager);
    const service = DenormalizationService();
    const candidates = await service.getCandidateEntitiesForEntity(sharedId, language);

    await entitiesDataSource.markMetadataAsChanged(candidates);

    if (index && candidates.length > 0) {
      await search.indexEntities(
        { sharedId: { $in: candidates.map(c => c.sharedId) } },
        '+fullText'
      );
    }
  }
};

const ignoreNewRelationshipsMetadata = async (
  currentDoc: EntitySchema,
  toSave: EntitySchema,
  template: TemplateSchema
) => {
  const newrelationshipProperties =
    template.properties?.filter(p => p.type === propertyTypes.newRelationship) || [];
  newrelationshipProperties.forEach(({ name }) => {
    if (toSave.metadata && currentDoc.metadata) {
      // eslint-disable-next-line no-param-reassign
      toSave.metadata[name] = currentDoc.metadata[name];
    }
  });
};

export {
  deleteRelatedNewRelationships,
  ignoreNewRelationshipsMetadata,
  markNewRelationshipsOfAffected,
  performNewRelationshipQueries,
};
