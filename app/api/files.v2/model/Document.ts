import { BaseFile } from './BaseFile';

export class Document extends BaseFile {
  readonly filename: string;

  constructor(id: string, entity: string, totalPages: number, filename: string) {
    super(id, entity, totalPages);
    this.filename = filename;
  }
}
