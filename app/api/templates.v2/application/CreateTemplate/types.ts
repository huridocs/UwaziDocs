import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { TemplateDto } from 'api/templates.v2/model/Template';
import { PropertyTypeSchema } from 'shared/types/commonTypes';

type PropertyDto = {
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

type CreateTemplateInput = {
  name: string;
  color: string;
  default: boolean;
  entityViewPage?: string;
  commonProperties: [PropertyDto, ...PropertyDto[]];
  properties: PropertyDto[];
};

type CreateTemplateOutput = TemplateDto;

type CreateTemplateProps = {
  templatesDS: TemplatesDataSource;
  settingsDS: SettingsDataSource;
};

type CreatePropertyProps = {
  generateRandomName?: boolean;
  templateId: string;
  property: PropertyDto;
};

export type { CreatePropertyProps, CreateTemplateInput, CreateTemplateOutput, CreateTemplateProps };
