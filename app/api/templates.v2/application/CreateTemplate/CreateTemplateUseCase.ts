import { UseCase } from 'api/common.v2/contracts/UseCase';
import { PropertyNameFactory } from 'api/templates.v2/model/PropertyNameFactory';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { CommonProperty } from 'api/templates.v2/model/CommonProperty';
import { TemplatesDataSource } from '../../contracts/TemplatesDataSource';
import { Property } from '../../model/Property';
import { Template } from '../../model/Template';
import {
  CreatePropertyInput,
  CreateTemplateInput,
  CreateTemplateInputSchema,
  CreateTemplateOutput,
  Dependencies,
} from './types';

export class CreateTemplateUseCase implements UseCase<CreateTemplateInput, CreateTemplateOutput> {
  private templatesDS: TemplatesDataSource;

  private settingsDS: SettingsDataSource;

  constructor({ templatesDS, settingsDS }: Dependencies) {
    this.templatesDS = templatesDS;
    this.settingsDS = settingsDS;
  }

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    CreateTemplateInputSchema.parse(input);
    const templateId = this.templatesDS.generateNextId();
    const settings = await this.settingsDS.readSettings();
    if (!settings) throw new Error('Settings not found');

    const template = new Template({
      id: templateId,
      color: input.color,
      isDefault: input.default,
      name: input.name,
      properties: this.createProperty(templateId, input.properties, settings.newNameGeneration),
    });

    await this.templatesDS.create(template);

    return template;
  }

  private createProperty(
    templateId: string,
    property: CreatePropertyInput[],
    generateRandomName?: boolean
  ) {
    return property.map(item => {
      if (item.isCommonProperty) {
        return new CommonProperty({
          id: this.templatesDS.generateNextId(),
          type: item.type,
          name:
            item.name ||
            PropertyNameFactory.create({
              value: item.label,
              generateRandomName,
              type: item.type,
            }),
          label: item.label,
          templateId,
        });
      }

      return new Property({
        id: this.templatesDS.generateNextId(),
        type: item.type,
        name: PropertyNameFactory.create({
          value: item.label,
          generateRandomName,
          type: item.type,
        }),
        label: item.label,
        templateId,
      });
    });
  }
}
