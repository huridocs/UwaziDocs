import {
  AbstractController,
  Dependencies as AbstractControllerDependencies,
} from 'api/common.v2/AbstractController';
import { Request } from 'express';
import { TemplateSchema } from 'shared/types/templateType';
import { PropertySchema } from 'shared/types/commonTypes';
import { CreateTemplateUseCase } from './CreateTemplateUseCase';

type Dependencies = {
  useCase: CreateTemplateUseCase;
} & AbstractControllerDependencies;

type CreateTemplateResponse = Omit<TemplateSchema, 'commonProperties'> & {
  commonProperties: PropertySchema[];
};

export class CreateTemplateController extends AbstractController {
  useCase: CreateTemplateUseCase;

  constructor({ useCase, ...rest }: Dependencies) {
    super(rest);
    this.useCase = useCase;
  }

  async handle(request: Request): Promise<void> {
    const output = await this.useCase.execute({
      name: request.body.name,
      color: request.body.color,
      default: request.body.default,
      entityViewPage: request.body.entityViewPage,
      properties: [...(request.body?.commonProperties || []), ...(request?.body.properties || [])],
    });

    const properties = output.properties.map(p => ({
      _id: p.id,
      name: p.name,
      label: p.label,
      type: p.type,
      isCommonProperty: p.isCommonProperty(),
    }));

    const response: CreateTemplateResponse = {
      _id: output.id,
      name: output.name,
      color: output.color,
      default: output.isDefault,
      properties: properties.filter(item => !item.isCommonProperty),
      commonProperties: properties.filter(item => item.isCommonProperty),
    };

    this.jsonResponse(response);
  }
}
