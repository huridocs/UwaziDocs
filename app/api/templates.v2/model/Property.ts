import { DomainObject, DomainObjectProps } from 'api/common.v2/domain/DomainObject';
import { PropertyType } from './PropertyType';

type PropertyUpdateInfo = {
  id: string;
  updatedAttributes: string[];
  oldProperty: Property;
  newProperty: Property;
};

type PropertyProps = {
  type: PropertyType;
  name: string;
  label: string;
  templateId: string;
} & DomainObjectProps;

class Property extends DomainObject {
  readonly type: PropertyType;

  readonly name: string;

  readonly label: string;

  readonly template: string;

  constructor({ type, name, label, templateId, ...rest }: PropertyProps) {
    super(rest);

    this.type = type;
    this.name = name;
    this.label = label;
    this.template = templateId;
  }

  isSame(other: Property) {
    return this.id === other.id;
  }

  updatedAttributes(other: Property): PropertyUpdateInfo {
    if (!this.isSame(other)) throw new Error('Trying to compare different properties.');
    if (this.type !== other.type) throw new Error("Can't change property types.");

    const updateInfo: PropertyUpdateInfo = {
      id: this.id,
      oldProperty: this,
      newProperty: other,
      updatedAttributes: [],
    };

    if (this.name !== other.name) updateInfo.updatedAttributes.push('name');
    if (this.label !== other.label) updateInfo.updatedAttributes.push('label');
    if (this.template !== other.template) updateInfo.updatedAttributes.push('template');

    return updateInfo;
  }

  isCommonProperty() {
    return false;
  }
}

export { Property };
export type { PropertyUpdateInfo, PropertyProps };
