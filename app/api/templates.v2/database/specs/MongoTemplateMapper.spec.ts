import { ObjectId } from 'mongodb';
import { MongoTemplateMapper } from '../MongoTemplateMapper';
import { createValidTemplate } from './fixtures';

describe('MongoTemplateMapper', () => {
  it('should map a Template to a TemplateDBO', () => {
    const template = createValidTemplate();
    const templateDBO = MongoTemplateMapper.toMongo(template);

    expect(templateDBO._id.toString()).toEqual(template.id);
    expect(templateDBO.name).toBe(template.name);
    expect(templateDBO.color).toBe(template.color);
    expect(templateDBO.default).toBe(template.isDefault);

    expect(
      templateDBO.properties.every((property: any) => !property.isCommonProperty)
    ).toBeTruthy();

    expect(
      templateDBO.commonProperties.every((property: any) => property.isCommonProperty)
    ).toBeTruthy();
  });

  it('should map a Property to a PropertySchema', () => {
    const template = createValidTemplate();
    const [property] = template.getProperties();

    const mongoProperty = MongoTemplateMapper.toMongoProperty(property);

    expect(mongoProperty).toEqual({
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
    });
  });
});
