import { DomainObject, DomainObjectProps } from 'api/common.v2/domain/DomainObject';
import { objectIndex } from 'shared/data_utils/objectIndex';
import { Property, PropertyUpdateInfo } from './Property';

type TemplateProps = {
  name: string;
  color: string;
  isDefault: boolean;
  properties: Property[];
} & DomainObjectProps;

class Template extends DomainObject {
  readonly name: string;

  readonly color: string;

  readonly isDefault: boolean;

  readonly properties: Property[];

  constructor({ id, name, color, isDefault, properties = [] }: TemplateProps) {
    super({ id });

    this.color = color;
    this.isDefault = isDefault;
    this.name = name;
    this.properties = properties;

    this.validate();
  }

  private validate() {
    const title = this.properties.find(item => item.isCommonProperty && item.type === 'text');
    const creationDate = this.properties.find(
      item => item.isCommonProperty && item.type === 'date' && item.name === 'creationDate'
    );
    const editDate = this.properties.find(
      item => item.isCommonProperty && item.type === 'date' && item.name === 'editDate'
    );

    if (!title) throw new Error('Title common property is required');
    if (!creationDate) throw new Error('Creation date common property is required');
    if (!editDate) throw new Error('Edit date common property is required');
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
    return this.properties.find(item => item.id === propertyId);
  }

  getCommonProperties() {
    return this.properties.filter(item => item.isCommonProperty);
  }

  getProperties() {
    return this.properties.filter(item => !item.isCommonProperty);
  }
}

export { Template };

export type { TemplateProps };
