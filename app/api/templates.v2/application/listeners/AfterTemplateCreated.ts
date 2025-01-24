import { EventEmitter } from 'api/common.v2/domain/event/event-emitter';
import { TemplateCreatedEvent } from 'api/templates.v2/model/TemplateCreatedEvent';

type Dependencies = {
  eventEmitter: EventEmitter;
};

export class AfterTemplateCreated {
  constructor(private dependencies: Dependencies) {
    this.dependencies.eventEmitter.listen({
      name: TemplateCreatedEvent.name,
      callback: AfterTemplateCreated.onAfterTemplateCreated,
    });
  }

  private static async onAfterTemplateCreated() {
    console.log('Do something');
  }
}
