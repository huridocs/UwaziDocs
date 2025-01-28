import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { Template } from 'api/templates.v2/model/Template';
import { EventEmitter } from 'api/common.v2/domain/event/event-emitter';
import { PropertyOptions } from 'api/templates.v2/model/Property';
import { PropertyType } from 'api/templates.v2/model/PropertyType';

type CreateTemplateInput = {
  name: string;
  color: string;
  isDefault: boolean;
  isEntityViewPage: boolean;

  properties: CreatePropertyInput[];
};

type CreateTemplateOutput = Template;

type Dependencies = {
  templatesDS: TemplatesDataSource;
  settingsDS: SettingsDataSource;
  eventEmitter: EventEmitter;
};

type CreatePropertyInput = {
  label: string;
  type: PropertyType;

  name?: string;
  isCommonProperty?: boolean;
  generatedId?: boolean;
  content?: string;
  relationType?: string;
  inherit?: {
    property: string;
    type: string;
  };

  style?: string;
  nestedProperties?: string[];
  query?: any[];
  denormalizedProperty?: string;
  targetTemplates?: string[];
} & PropertyOptions;

export type { CreateTemplateInput, CreatePropertyInput, CreateTemplateOutput, Dependencies };
