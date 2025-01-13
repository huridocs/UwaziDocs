import { UseCase } from 'api/common.v2/contracts/UseCase';
import { PropertyNameFactory } from 'api/templates.v2/model/PropertyNameFactory';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { TemplatesDataSource } from '../../contracts/TemplatesDataSource';
import { Property } from '../../model/Property';
import { Template } from '../../model/Template';
import {
  CreatePropertyProps,
  CreateTemplateInput,
  CreateTemplateOutput,
  CreateTemplateProps,
} from './types';

export class CreateTemplate implements UseCase<CreateTemplateInput, CreateTemplateOutput> {
  private templatesDS: TemplatesDataSource;

  private settingsDS: SettingsDataSource;

  constructor({ templatesDS, settingsDS }: CreateTemplateProps) {
    this.templatesDS = templatesDS;
    this.settingsDS = settingsDS;
  }

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    const templateId = this.templatesDS.generateNextId();
    const settings = await this.settingsDS.readSettings();
    if (!settings) throw new Error('Settings not found');

    const template = new Template({
      id: templateId,
      color: input.color,
      isDefault: input.default,
      name: input.name,
      properties: input.properties.map(property =>
        this.createProperty({
          property,
          generateRandomName: settings.newNameGeneration,
          templateId,
        })
      ),
      commonProperties: input.commonProperties.map(property =>
        this.createProperty({
          property,
          generateRandomName: settings.newNameGeneration,
          templateId,
        })
      ),
    });

    await this.templatesDS.create(template);

    return template.toObject();
  }

  private createProperty({
    property,
    generateRandomName,
    templateId,
  }: CreatePropertyProps): Property {
    return new Property(
      this.templatesDS.generateNextId(),
      property.type,
      PropertyNameFactory.create({
        value: property.label,
        generateRandomName,
        type: property.type,
      }),
      property.label,
      templateId
    );
  }
}
