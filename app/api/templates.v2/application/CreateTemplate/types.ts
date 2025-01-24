import { z } from 'zod';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { PropertyTypeSchema } from 'api/templates.v2/model/PropertyType';
import { Template } from 'api/templates.v2/model/Template';
import { EventEmitter } from 'api/common.v2/domain/event/event-emitter';

type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;

type CreateTemplateOutput = Template;

type Dependencies = {
  templatesDS: TemplatesDataSource;
  settingsDS: SettingsDataSource;
  eventEmitter: EventEmitter;
};

type CreatePropertyInput = z.infer<typeof CreatePropertyInputSchema>;

const CreatePropertyInputSchema = z.object({
  label: z.string(),
  type: PropertyTypeSchema,

  name: z.string().optional(),
  isCommonProperty: z.boolean().optional(),
  prioritySorting: z.boolean().optional(),
  generatedId: z.boolean().optional(),
  content: z.string().optional(),
  relationType: z.string().optional(),
  inherit: z
    .object({
      property: z.string(),
      type: PropertyTypeSchema,
    })
    .optional(),
  filter: z.boolean().optional(),
  noLabel: z.boolean().optional(),
  fullWidth: z.boolean().optional(),
  defaultfilter: z.boolean().optional(),
  required: z.boolean().optional(),
  sortable: z.boolean().optional(),
  showInCard: z.boolean().optional(),
  style: z.string().optional(),
  nestedProperties: z.array(z.string()).optional(),
  query: z.array(z.any()).optional(),
  denormalizedProperty: z.string().optional(),
  targetTemplates: z.array(z.string()).optional(),
});

const CreateTemplateInputSchema = z.object({
  name: z.string(),
  color: z.string(),
  default: z.boolean(),
  entityViewPage: z.string().optional(),
  properties: z.array(CreatePropertyInputSchema),
});

export { CreateTemplateInputSchema };
export type { CreateTemplateInput, CreatePropertyInput, CreateTemplateOutput, Dependencies };
