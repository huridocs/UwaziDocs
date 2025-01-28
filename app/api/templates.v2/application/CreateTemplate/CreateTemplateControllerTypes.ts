import { z } from 'zod';
import { Dependencies as AbstractControllerDependencies } from 'api/common.v2/AbstractController';
import { TemplateSchema } from 'shared/types/templateType';
import { PropertySchema } from 'shared/types/commonTypes';
import { PropertyTypeSchema } from 'api/templates.v2/model/PropertyType';
import { CreateTemplateUseCase } from './CreateTemplateUseCase';

type Dependencies = {
  useCase: CreateTemplateUseCase;
} & AbstractControllerDependencies;

type CreateTemplateResponse = Omit<TemplateSchema, 'commonProperties'> & {
  commonProperties: PropertySchema[];
};

const CreatePropertySchema = z.object({
  label: z.string(), // ok
  type: PropertyTypeSchema, // ok

  name: z.string().optional(), // ok
  isCommonProperty: z.boolean().optional(), // ok
  content: z.string().optional(), // ok
  filter: z.boolean().optional(), // ok
  sortable: z.boolean().optional(), // ok
  required: z.boolean().optional(), // ok
  noLabel: z.boolean().optional(), // ok
  showInCard: z.boolean().optional(), // ok
  prioritySorting: z.boolean().optional(), // ok
  defaultfilter: z.boolean().optional(), // ok
  fullWidth: z.boolean().optional(), // ok
  style: z.string().optional(), // ok

  generatedId: z.boolean().optional(),
  relationType: z.string().optional(),
  inherit: z
    .object({
      property: z.string(),
      type: PropertyTypeSchema,
    })
    .optional(),
  nestedProperties: z.array(z.string()).optional(),
  query: z.array(z.any()).optional(),
  denormalizedProperty: z.string().optional(),
  targetTemplates: z.array(z.string()).optional(),
});

const CreateTemplateRequestSchema = z.object({
  name: z.string(),
  color: z.string(),
  default: z.boolean(),

  entityViewPage: z.string().optional(), // Todo: Don't know what this is

  commonProperties: z.array(CreatePropertySchema).min(3),
  properties: z.array(CreatePropertySchema),
});

export type { Dependencies, CreateTemplateResponse };

export { CreateTemplateRequestSchema };
