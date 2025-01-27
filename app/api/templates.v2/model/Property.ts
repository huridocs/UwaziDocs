import { DomainObject, DomainObjectProps } from 'api/common.v2/domain/DomainObject';
import { PropertyType } from './PropertyType';

type PropertyUpdateInfo = {
  id: string;
  updatedAttributes: string[];
  oldProperty: Property;
  newProperty: Property;
};

type PropertyOptions = {
  isRequired?: boolean;
  isSortable?: boolean;
  isPrioritySorting?: boolean;
  isDefaultFilter?: boolean;
  isFilter?: boolean;
  isFullWidth?: boolean;

  noLabel?: boolean;
  showInCard?: boolean;
};

type PropertyProps = {
  type: PropertyType;
  name: string;
  label: string;
  templateId: string;
  isCommonProperty?: boolean;
} & DomainObjectProps &
  PropertyOptions;

class Property extends DomainObject {
  readonly type: PropertyType;

  readonly name: string;

  readonly label: string;

  readonly template: string;

  readonly options: PropertyOptions;

  private _isCommonProperty?: boolean;

  constructor({ id, ...rest }: PropertyProps) {
    super({ id });

    this.type = rest.type;
    this.name = rest.name;
    this.label = rest.label;
    this.template = rest.templateId;
    this._isCommonProperty = rest.isCommonProperty;
    this.options = {
      isRequired: rest.isRequired,
      isSortable: rest.isSortable,
      isPrioritySorting: rest.isPrioritySorting,
      isDefaultFilter: rest.isDefaultFilter,
      isFilter: rest.isFilter,
      isFullWidth: rest.isFullWidth,
      noLabel: rest.noLabel,
      showInCard: rest.showInCard,
    };
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

  get isCommonProperty() {
    return !!this._isCommonProperty;
  }
}

export { Property };
export type { PropertyUpdateInfo, PropertyProps, PropertyOptions };
