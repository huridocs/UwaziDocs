import { UseCase } from 'api/common.v2/contracts/UseCase';
import { PropertyNameFactory } from 'api/templates.v2/model/PropertyNameFactory';
import { CommonProperty } from 'api/templates.v2/model/CommonProperty';
import { TemplateCreatedEvent } from 'api/templates.v2/model/TemplateCreatedEvent';
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
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private dependencies: Dependencies) {} // Eslint rules prevent us from taking advantages of properties declaration shortcut.

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    CreateTemplateInputSchema.parse(input);
    const templateId = this.dependencies.templatesDS.generateNextId();
    const settings = await this.dependencies.settingsDS.readSettings();
    if (!settings) throw new Error('Settings not found');

    const template = new Template({
      id: templateId,
      color: input.color,
      isDefault: input.default,
      name: input.name,
      properties: this.createProperty(templateId, input.properties, settings.newNameGeneration),
    });

    await this.dependencies.templatesDS.create(template);

    this.dependencies.eventEmitter.emit(new TemplateCreatedEvent(template));

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
          id: this.dependencies.templatesDS.generateNextId(),
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
        id: this.dependencies.templatesDS.generateNextId(),
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
