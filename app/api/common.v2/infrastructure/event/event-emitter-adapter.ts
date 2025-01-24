import EventEmitter3 from 'eventemitter3';

import { Event } from 'api/common.v2/domain/event/event';
import { EventEmitter, ListenInput } from 'api/common.v2/domain/event/event-emitter';

export class EventEmitter3Adapter implements EventEmitter {
  private instance: EventEmitter3;

  constructor() {
    this.instance = new EventEmitter3();
  }

  emit(aEvent: Event): void {
    this.instance.emit(aEvent.name, aEvent);
  }

  listen(input: ListenInput): void {
    this.instance.addListener(input.name, input.callback as any);
  }
}
