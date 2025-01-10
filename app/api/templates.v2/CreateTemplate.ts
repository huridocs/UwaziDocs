import { UseCase } from 'api/common.v2/contracts/UseCase';
import { PropertyTypeSchema } from 'shared/types/commonTypes';
import { TemplatesDataSource } from './contracts/TemplatesDataSource';
import { CommonProperty } from './model/CommonProperty';
import { Property } from './model/Property';
import { Template } from './model/Template';

export type NewPropertySchema = {
  label: string;
  type: PropertyTypeSchema;
  name?: string;
  prioritySorting?: boolean;
  generatedId?: boolean;
  content?: string;
  relationType?: string;
  inherit?: {
    property?: string;
    type?: PropertyTypeSchema;
  };
  filter?: boolean;
  noLabel?: boolean;
  fullWidth?: boolean;
  defaultfilter?: boolean;
  required?: boolean;
  sortable?: boolean;
  showInCard?: boolean;
  style?: string;
  nestedProperties?: string[];
  query?: unknown[];
  denormalizedProperty?: string;
  targetTemplates?: false | string[];
};

export type NewTemplateInputModel = {
  name: string;
  color: string;
  default: boolean;
  entityViewPage: string;
  commonProperties: [NewPropertySchema, ...NewPropertySchema[]];
  properties: NewPropertySchema[];
};

export type TemplateInputModel = NewTemplateInputModel & { id: string };

type Output = any;

export class CreateTemplate implements UseCase<TemplateInputModel, Output> {
  private templatesDS: TemplatesDataSource;

  constructor(templatesDS: TemplatesDataSource) {
    this.templatesDS = templatesDS;
  }

  async execute(input: NewTemplateInputModel): Promise<Output> {
    const template = this.fromInputModel({
      ...input,
      id: this.templatesDS.generateNextId(),
    });

    await this.templatesDS.create(template);

    return {
      ...input,
      id: this.templatesDS.generateNextId(),
    };
  }

  private fromInputModel(input: TemplateInputModel) {
    return new Template({
      id: input.id,
      color: input.color,
      isDefault: input.default,
      name: input.name,
      properties: input.properties.map(
        property =>
          new Property(
            this.templatesDS.generateNextId(),
            property.type,
            property.name,
            property.label,
            input.id
          )
      ),
      commonProperties: input.commonProperties.map(
        property =>
          new CommonProperty(
            this.templatesDS.generateNextId(),
            property.type,
            property.name,
            property.label,
            input.id
          )
      ),
    });
  }
}
