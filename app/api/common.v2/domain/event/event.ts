type EventProps = {
  name: string;
  payload: any;
};

export class Event {
  occurredAt: Date;

  name: string;

  payload: any;

  constructor(props: EventProps) {
    this.occurredAt = new Date();
    this.name = props.name;
    this.payload = props.payload;
  }
}
