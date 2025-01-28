import { DomainObject, DomainObjectProps } from 'api/common.v2/domain/DomainObject';
import { PropertyType } from './PropertyType';
import { CreatePropertyNameProps, PropertyNameFactory } from './PropertyNameFactory';

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

type CreatePropertyInput = {
  shouldGenerateRandomName?: boolean;
  name?: string;
} & Omit<PropertyProps, 'name'>;

type ProcessNameInput = {
  name?: string;
} & CreatePropertyNameProps;

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

  protected static processName(input: ProcessNameInput) {
    return (
      input.name ||
      PropertyNameFactory.create({
        type: input.type,
        label: input.label,
        shouldGenerateRandomName: input.shouldGenerateRandomName,
      })
    );
  }

  static create({ shouldGenerateRandomName, ...rest }: CreatePropertyInput) {
    const name = this.processName({
      name: rest.name,
      shouldGenerateRandomName,
      label: rest.label,
      type: rest.type,
    });

    return new Property({
      ...rest,
      name,
    });
  }

  get isCommonProperty() {
    return !!this._isCommonProperty;
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
}

export { Property };
export type { CreatePropertyInput, PropertyUpdateInfo, PropertyProps, PropertyOptions };
