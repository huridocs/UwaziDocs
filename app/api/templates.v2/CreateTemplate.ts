import { UseCase } from 'api/common.v2/contracts/UseCase';
import { PropertySchema } from 'shared/types/commonTypes';
import { Template } from './model/Template';
import { TemplatesDataSource } from './contracts/TemplatesDataSource';
import { Property } from './model/Property';
import { CommonProperty } from './model/CommonProperty';

export type NewTemplateInputModel = {
  name: string;
  color: string;
  default: boolean;
  entityViewPage: string;
  commonProperties?: [PropertySchema, ...PropertySchema[]];
  properties?: PropertySchema[];
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
    return new Template(
      input.id,
      input.name,
      input.properties?.map(property => {
        return new Property(property._id, property.type, property.name, property.label, input.id);
      }),
      input.commonProperties?.map(property => {
        return new CommonProperty(
          property._id,
          property.type,
          property.name,
          property.label,
          input.id
        );
      })
    );
  }
}
