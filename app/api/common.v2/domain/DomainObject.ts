import { Event } from './Event';
import { IdentifiedDomainObject, IdentifiedDomainObjectProps } from './IdentifiedDomainObject';

type DomainObjectProps = IdentifiedDomainObjectProps;

export abstract class DomainObject extends IdentifiedDomainObject {
  private events: Event[] = [];

  protected addEvent(event: Event): void {
    this.events.push(event);
  }

  releaseEvents() {
    const events = [...this.events];
    this.events = [];

    return events;
  }
}

export type { DomainObjectProps };
