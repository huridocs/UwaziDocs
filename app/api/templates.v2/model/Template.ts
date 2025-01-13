import { DomainObject, DomainObjectProps } from 'api/common.v2/domain/DomainObject';
import { objectIndex } from 'shared/data_utils/objectIndex';
import { Property, PropertyUpdateInfo } from './Property';

type TemplateProps = {
  name: string;
  color: string;
  isDefault: boolean;
  properties: Property[];
  commonProperties: Property[];
} & DomainObjectProps;

type TemplateDto = ReturnType<Template['toObject']>;

class Template extends DomainObject {
  readonly name: string;

  readonly color: string;

  readonly isDefault: boolean;

  readonly properties: Property[] = [];

  readonly commonProperties: Property[] = [];

  constructor({
    id,
    name,
    color,
    isDefault,
    properties = [],
    commonProperties = [],
  }: TemplateProps) {
    super({ id });

    this.color = color;
    this.isDefault = isDefault;
    this.name = name;
    this.properties = properties;
    this.commonProperties = commonProperties;
  }

  selectNewProperties(newTemplate: Template): Property[] {
    const oldIdSet = new Set(this.properties.map(p => p.id));
    return newTemplate.properties.filter(p => !oldIdSet.has(p.id));
  }

  selectUpdatedProperties = (newTemplate: Template): PropertyUpdateInfo[] => {
    const oldPropertiesById = objectIndex(
      this.properties,
      p => p.id,
      p => p
    );
    const newProperties = newTemplate.properties.filter(p => p.id in oldPropertiesById);
    const newPropertiesById = objectIndex(
      newProperties,
      p => p.id,
      p => p
    );
    const updateInfo = Object.entries(newPropertiesById).map(([id, newProperty]) => {
      const oldProperty = oldPropertiesById[id];
      return oldProperty.updatedAttributes(newProperty);
    });
    return updateInfo;
  };

  getPropertyById(propertyId: string) {
    const property = this.properties.find(p => p.id === propertyId);
    if (property) {
      return property;
    }

    const commonProperty = this.commonProperties.find(p => p.id === propertyId);
    if (commonProperty) {
      return commonProperty;
    }

    return null;
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isDefault: this.isDefault,
      properties: this.properties.map(p => p.toObject()),
      commonProperties: this.commonProperties.map(p => p.toObject()),
    };
  }
}

export { Template };

export type { TemplateProps, TemplateDto };
