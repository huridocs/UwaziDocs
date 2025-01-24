import { Event } from 'api/common.v2/domain/event/event';
import { Template } from './Template';

export class TemplateCreatedEvent extends Event {
  static name = 'template_created_event';

  constructor(payload: Template) {
    super({ name: TemplateCreatedEvent.name, payload });
  }
}
