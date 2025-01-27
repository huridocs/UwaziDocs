import { Request } from 'express';
import { AbstractController } from 'api/common.v2/AbstractController';

import { CreateTemplateUseCase } from './CreateTemplateUseCase';
import {
  CreateTemplateRequestSchema,
  CreateTemplateResponse,
  Dependencies,
} from './CreateTemplateControllerTypes';

export class CreateTemplateController extends AbstractController {
  useCase: CreateTemplateUseCase;

  constructor({ useCase, ...rest }: Dependencies) {
    super(rest);
    this.useCase = useCase;
  }

  async handle(request: Request): Promise<void> {
    const dto = CreateTemplateRequestSchema.parse(request.body);

    const output = await this.useCase.execute({
      name: dto.name,
      color: dto.color,
      isDefault: dto.default,
      isEntityViewPage: dto.entityViewPage, // Todo: Don't know what this is
      properties: [...(dto?.commonProperties || []), ...(request?.body.properties || [])],
    });

    const properties = output.properties.map(p => ({
      _id: p.id,
      name: p.name,
      label: p.label,
      type: p.type,
      isCommonProperty: p.isCommonProperty,
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
