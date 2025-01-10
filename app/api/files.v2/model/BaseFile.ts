export class BaseFile {
  readonly id: string;

  readonly entity: string;

  readonly totalPages: number;

  creationDate?: Date;

  constructor(id: string, entity: string, totalPages: number) {
    this.id = id;
    this.entity = entity;
    this.totalPages = totalPages;
  }

  withCreationDate(date: Date) {
    this.creationDate = date;
    return this;
  }
}
