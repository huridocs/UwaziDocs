import { ObjectId } from 'mongodb';
import { PropertySchema } from 'shared/types/commonTypes';

import { Template } from '../model/Template';
import { RelationshipPropertyDBO, TemplateDBO } from './schemas/TemplateDBO';
import { Property } from '../model/Property';

export class MongoTemplateMapper {
  static toMongoProperty(property: Property): PropertySchema | RelationshipPropertyDBO {
    return {
      _id: new ObjectId(property.id),
      type: property.type,
      name: property.name,
      label: property.label,
      isCommonProperty: property.isCommonProperty,
      fullWidth: property.options?.isFullWidth,
      noLabel: property.options?.noLabel,
      required: property.options?.isRequired,
      sortable: property.options?.isSortable,
      showInCard: property.options?.showInCard,
      defaultfilter: property.options?.isDefaultFilter,
      filter: property.options?.isFilter,
      prioritySorting: property.options?.isPrioritySorting,
    };
  }

  static toMongo(template: Template): TemplateDBO {
    return {
      _id: new ObjectId(template.id),
      name: template.name,
      color: template.color,
      default: template.isDefault,
      properties: template.getProperties().map(MongoTemplateMapper.toMongoProperty),
      commonProperties: template
        .getCommonProperties()
        .map(MongoTemplateMapper.toMongoProperty) as any,
    };
  }
}
