import { Event } from './event';

export type ListenInput = {
  name: string;
  callback: Function;
};

export interface EventEmitter {
  emit(aEvent: Event): void;
  listen(input: ListenInput): void;
}
