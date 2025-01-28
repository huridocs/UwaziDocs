import { UseCase } from 'api/common.v2/contracts/UseCase';
import { TemplateCreatedEvent } from 'api/templates.v2/model/TemplateCreatedEvent';
import { PropertyFactory } from 'api/templates.v2/model/PropertyFactory';
import { Template } from '../../model/Template';
import {
  CreateTemplateInput,
  CreateTemplateOutput,
  Dependencies,
} from './CreateTemplateUseCaseTypes';

export class CreateTemplateUseCase implements UseCase<CreateTemplateInput, CreateTemplateOutput> {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private dependencies: Dependencies) {} // Eslint rules prevent us from taking advantages of properties declaration shortcut.

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    const templateId = this.dependencies.templatesDS.generateNextId();
    const settings = await this.dependencies.settingsDS.readSettings();
    if (!settings) throw new Error('Settings not found');

    const properties = input.properties.map(property =>
      PropertyFactory.create({
        ...property,
        templateId,
        id: this.dependencies.templatesDS.generateNextId(),
        shouldGenerateRandomName: settings.newNameGeneration,
      })
    );

    const template = new Template({
      id: templateId,
      color: input.color,
      isDefault: input.isDefault,
      name: input.name,
      properties,
    });

    await this.dependencies.templatesDS.create(template);

    this.dependencies.eventEmitter.emit(new TemplateCreatedEvent(template));

    return template;
  }
}
