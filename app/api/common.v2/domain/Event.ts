import { IdentifiedDomainObject, IdentifiedDomainObjectProps } from './IdentifiedDomainObject';

type EventProps<PayloadType> = {
  payload: PayloadType;
} & IdentifiedDomainObjectProps;

export abstract class Event<PayloadType = any> extends IdentifiedDomainObject {
  date: Date;

  payload: PayloadType;

  constructor({ id, payload }: EventProps<PayloadType>) {
    super({ id });

    this.date = new Date();
    this.payload = payload;
  }
}
