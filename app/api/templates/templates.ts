import { ClientSession, ObjectId } from 'mongodb';

import entities from 'api/entities';
import { populateGeneratedIdByTemplate } from 'api/entities/generatedIdPropertyAutoFiller';
import { applicationEventsBus } from 'api/eventsbus';
import translations from 'api/i18n/translations';
import { WithId } from 'api/odm';
import { updateMapping } from 'api/search/entitiesIndex';
import settings from 'api/settings/settings';
import dictionariesModel from 'api/thesauri/dictionariesModel';
import createError from 'api/utils/Error';
import { objectIndex } from 'shared/data_utils/objectIndex';
import { propertyTypes } from 'shared/propertyTypes';
import { ContextType } from 'shared/translationSchema';
import { ensure } from 'shared/tsUtils';
import { PropertySchema } from 'shared/types/commonTypes';
import { validateTemplate } from 'shared/types/templateSchema';
import { TemplateSchema } from 'shared/types/templateType';
import { TemplateDeletedEvent } from './events/TemplateDeletedEvent';
import { TemplateUpdatedEvent } from './events/TemplateUpdatedEvent';
import { checkIfReindex } from './reindex';
import model from './templatesModel';
import {
  denormalizeInheritedProperties,
  generateNames,
  getDeletedProperties,
  getRenamedTitle,
  getUpdatedNames,
  updateExtractedMetadataProperties,
} from './utils';
import * as v2 from './v2_support';

const createTranslationContext = (template: TemplateSchema) => {
  const titleProperty = ensure<PropertySchema>(
    ensure<PropertySchema[]>(template.commonProperties).find(p => p.name === 'title')
  );

  const context = (template.properties || []).reduce<{ [k: string]: string }>((ctx, prop) => {
    ctx[prop.label] = prop.label;
    return ctx;
  }, {});

  context[template.name] = template.name;
  context[titleProperty.label] = titleProperty.label;
  return context;
};

const addTemplateTranslation = async (template: WithId<TemplateSchema>) =>
  translations.addContext(
    template._id.toString(),
    template.name,
    createTranslationContext(template),
    ContextType.entity
  );

const updateTranslation = async (
  currentTemplate: WithId<TemplateSchema>,
  template: TemplateSchema
) => {
  const currentProperties = currentTemplate.properties;
  const newProperties = template.properties || [];
  const updatedLabels = getUpdatedNames(
    {
      prop: 'label',
      filterBy: '_id',
    },
    currentProperties,
    newProperties
  ).update;
  if (currentTemplate.name !== template.name) {
    updatedLabels[currentTemplate.name] = template.name;
  }
  const deletedPropertiesByLabel = getDeletedProperties(
    currentProperties,
    newProperties,
    '_id',
    'label'
  );
  deletedPropertiesByLabel.push(
    ...getRenamedTitle(
      ensure<PropertySchema[]>(currentTemplate.commonProperties),
      ensure<PropertySchema[]>(template.commonProperties)
    )
  );

  const context = createTranslationContext(template);

  return translations.updateContext(
    { id: currentTemplate._id.toString(), label: template.name, type: 'Entity' },
    updatedLabels,
    deletedPropertiesByLabel,
    context
  );
};

const removeExcludedPropertiesValues = async (
  currentTemplate: TemplateSchema,
  template: TemplateSchema
) => {
  const currentTemplateContentProperties = (currentTemplate.properties || []).filter(
    p => p.content
  );
  const templateContentProperties = (template.properties || []).filter(p => p.content);
  const toRemoveValues = currentTemplateContentProperties
    .map(prop => {
      const sameProperty = templateContentProperties.find(
        p => p._id?.toString() === prop._id?.toString()
      );
      if (sameProperty && sameProperty.content !== prop.content) {
        return sameProperty.name;
      }
      return null;
    })
    .filter(v => v);

  if (toRemoveValues.length > 0) {
    await entities.removeValuesFromEntities(toRemoveValues, currentTemplate._id);
  }
};

const checkAndFillGeneratedIdProperties = async (
  currentTemplate: TemplateSchema,
  template: TemplateSchema
) => {
  const storedGeneratedIdProps =
    currentTemplate.properties?.filter(prop => prop.type === propertyTypes.generatedid) || [];
  const newGeneratedIdProps =
    template.properties?.filter(
      newProp =>
        !newProp._id &&
        newProp.type === propertyTypes.generatedid &&
        !storedGeneratedIdProps.find(prop => prop.name === newProp.name)
    ) || [];
  if (newGeneratedIdProps.length > 0) {
    await populateGeneratedIdByTemplate(currentTemplate._id!, newGeneratedIdProps);
  }
  return newGeneratedIdProps.length > 0;
};

const _save = async (template: TemplateSchema) => {
  const newTemplate = await model.save(template, undefined);
  await addTemplateTranslation(newTemplate);
  return newTemplate;
};

const getRelatedThesauri = async (template: TemplateSchema, session?: ClientSession) => {
  const thesauriIds = (template.properties || []).map(p => p.content).filter(p => p);
  const thesauri = await dictionariesModel.get({ _id: { $in: thesauriIds } }, undefined, {
    session,
  });
  const thesauriByKey: Record<any, TemplateSchema> = {};
  thesauri.forEach(t => {
    thesauriByKey[t._id.toString()] = t;
  });
  return thesauriByKey;
};

export default {
  async save(template: TemplateSchema, language: string, reindex = true) {
    template.properties = template.properties || [];
    template.properties = await generateNames(template.properties);
    template.properties = await denormalizeInheritedProperties(template);

    await validateTemplate(template);
    const mappedTemplate = await v2.processNewRelationshipProperties(template);

    await this.swapNamesValidation(mappedTemplate);

    if (reindex) {
      await updateMapping([mappedTemplate]);
    }

    return mappedTemplate._id
      ? this._update(mappedTemplate, language, reindex)
      : _save(mappedTemplate);
  },

  async swapNamesValidation(template: TemplateSchema) {
    if (!template._id) {
      return;
    }
    const current = await this.getById(ensure(template._id));

    const currentTemplate = ensure<TemplateSchema>(current);
    currentTemplate.properties = currentTemplate.properties || [];
    currentTemplate.properties.forEach(prop => {
      const swapingNameWithExistingProperty = (template.properties || []).find(
        p => p.name === prop.name && p._id?.toString() !== prop._id?.toString()
      );
      if (swapingNameWithExistingProperty) {
        throw createError(`Properties can't swap names: ${prop.name}`, 400);
      }
    });
  },

  async _update(template: TemplateSchema, language: string, _reindex = true) {
    const reindex = _reindex && !template.synced;
    const templateStructureChanges = await checkIfReindex(template);
    const currentTemplate = ensure<WithId<TemplateSchema>>(
      await this.getById(ensure(template._id))
    );
    if (templateStructureChanges || currentTemplate.name !== template.name) {
      await updateTranslation(currentTemplate, template);
    }
    if (templateStructureChanges) {
      await removeExcludedPropertiesValues(currentTemplate, template);
      await updateExtractedMetadataProperties(currentTemplate.properties, template.properties);
    }

    const generatedIdAdded = await checkAndFillGeneratedIdProperties(currentTemplate, template);
    const savedTemplate = await model.save(template, undefined);
    if (templateStructureChanges) {
      await v2.processNewRelationshipPropertiesOnUpdate(currentTemplate, savedTemplate);

      await entities.updateMetadataProperties(template, currentTemplate, language, {
        reindex,
        generatedIdAdded,
      });
    }

    await applicationEventsBus.emit(
      new TemplateUpdatedEvent({
        before: currentTemplate,
        after: savedTemplate,
      })
    );

    return savedTemplate;
  },

  async canDeleteProperty(
    template: ObjectId,
    property: ObjectId | string | undefined,
    session?: ClientSession
  ) {
    const tmps = await model.get({}, undefined, { session });
    return tmps.every(iteratedTemplate =>
      (iteratedTemplate.properties || []).every(
        iteratedProperty =>
          !iteratedProperty.content ||
          !iteratedProperty.inherit?.property ||
          !(
            iteratedProperty.content.toString() === template.toString() &&
            iteratedProperty.inherit.property.toString() === (property || '').toString()
          )
      )
    );
  },

  async get(query: any = {}) {
    return model.get(query);
  },

  async getPropertyByName(propertyName: string): Promise<PropertySchema> {
    const [property] = await this.getPropertiesByName([propertyName]);
    return property;
  },

  async getPropertiesByName(propertyNames: string[]): Promise<PropertySchema[]> {
    const nameSet = new Set(propertyNames);
    const templates = await this.get({
      $or: [
        { 'properties.name': { $in: propertyNames } },
        { 'commonProperties.name': { $in: propertyNames } },
      ],
    });
    const allProperties = templates
      .map(template => [template.properties || [], template.commonProperties || []])
      .flat()
      .flat()
      .filter(t => nameSet.has(t.name));
    const propertiesByName = objectIndex(
      allProperties,
      p => p.name,
      p => p
    );
    const missingProperties = propertyNames.filter(name => !propertiesByName[name]);
    if (missingProperties.length > 0) {
      throw createError(`Properties not found: ${missingProperties.join(', ')}`);
    }
    return Array.from(Object.values(propertiesByName));
  },

  async setAsDefault(_id: string) {
    const [templateToBeDefault] = await this.get({ _id });
    const [currentDefault] = await this.get({ _id: { $nin: [_id] }, default: true });

    if (templateToBeDefault) {
      let saveCurrentDefault = Promise.resolve({});
      if (currentDefault) {
        saveCurrentDefault = model.save(
          {
            _id: currentDefault._id,
            default: false,
          },
          undefined
        );
      }
      return Promise.all([model.save({ _id, default: true }, undefined), saveCurrentDefault]);
    }

    throw createError('Invalid ID');
  },

  async getById(templateId: ObjectId | string) {
    return model.getById(templateId, undefined);
  },

  async removePropsWithNonexistentId(nonexistentId: string, session?: ClientSession) {
    const relatedTemplates = await model.get({ 'properties.content': nonexistentId }, undefined, {
      session,
    });
    const defaultLanguage = (await settings.getDefaultLanguage())?.key;
    if (!defaultLanguage) {
      throw Error('Missing default language.');
    }
    await Promise.all(
      relatedTemplates.map(async t =>
        this.save(
          {
            ...t,
            properties: (t.properties || []).filter(prop => prop.content !== nonexistentId),
          },
          defaultLanguage,
          false
        )
      )
    );
  },

  async delete(template: Partial<TemplateSchema>) {
    const count = await this.countByTemplate(ensure(template._id));
    if (count > 0) {
      return Promise.reject({ key: 'documents_using_template', value: count });
    }

    await v2.processNewRelationshipPropertiesOnDelete(template._id);

    const _id = ensure<string>(template._id);
    await translations.deleteContext(_id);
    await this.removePropsWithNonexistentId(_id);
    await model.delete(_id);

    await applicationEventsBus.emit(new TemplateDeletedEvent({ templateId: _id }));

    return template;
  },

  async countByTemplate(template: string, session?: ClientSession) {
    return entities.countByTemplate(template, session);
  },

  async countByThesauri(thesauriId: string) {
    return model.count({ 'properties.content': thesauriId });
  },

  async findUsingRelationTypeInProp(relationTypeId: string, session?: ClientSession) {
    return model.get({ 'properties.relationType': relationTypeId }, 'name', { session });
  },

  getRelatedThesauri,
};
