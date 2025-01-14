import { Response } from 'express';
import { CreateTemplateController } from '../CreateTemplate/CreateTemplateController';
import { CreateTemplateUseCase } from '../CreateTemplate/CreateTemplateUseCase';

const createUseCase = (): CreateTemplateUseCase =>
  ({
    execute: jest.fn(),
  }) as any;

const createExpress = () => ({
  next: jest.fn(),
  res: {
    json: jest.fn(),
  } as any as Response,
});

const createSut = () => {
  const useCase = createUseCase();
  const express = createExpress();
  const controller = new CreateTemplateController({
    useCase,
    ...express,
  });

  return {
    controller,
    useCase,
    ...express,
  };
};

describe('CreateTemplateController', () => {
  it('should call CreateTemplateUseCase with correct params', async () => {
    const { controller, useCase } = createSut();
    useCase.execute = jest.fn().mockResolvedValue({
      id: 'any_id',
      name: 'any_name',
      color: 'any_color',
      isDefault: true,
      properties: [],
    });

    await controller.handle({
      body: {
        name: 'any_name',
        color: 'any_color',
        default: true,
        commonProperties: [{ name: 'commom' }],
        properties: [{ name: 'properties' }],
        random_properties: 'asd',
        not_allowed_properties: 'random properties',
      },
    } as any);

    expect(useCase.execute).toHaveBeenCalledWith({
      name: 'any_name',
      color: 'any_color',
      default: true,
      properties: [{ name: 'commom' }, { name: 'properties' }],
    });
  });

  it('should return correct DTO to web client', async () => {
    const { controller, useCase, res } = createSut();
    useCase.execute = jest.fn().mockResolvedValue({
      id: 'any_id',
      name: 'any_name',
      color: 'any_color',
      isDefault: true,
      properties: [
        {
          id: 'any_id_common',
          name: 'any_name_common',
          label: 'any_label_common',
          type: 'any_type_common',
          isCommonProperty: () => true,
        },
        {
          id: 'any_id',
          name: 'any_name',
          label: 'any_label',
          type: 'any_type',
          isCommonProperty: () => false,
        },
      ],
    });

    await controller.handle({ body: {} } as any);

    expect(res.json).toHaveBeenCalledWith({
      _id: 'any_id',
      name: 'any_name',
      color: 'any_color',
      default: true,
      properties: [
        {
          _id: 'any_id',
          name: 'any_name',
          label: 'any_label',
          type: 'any_type',
          isCommonProperty: false,
        },
      ],
      commonProperties: [
        {
          _id: 'any_id_common',
          name: 'any_name_common',
          label: 'any_label_common',
          type: 'any_type_common',
          isCommonProperty: true,
        },
      ],
    });
  });
});
