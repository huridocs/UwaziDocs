export class SourceTemplateNotFoundError extends Error {
  constructor(targetTemplateId: string) {
    super(`Source template with id ${targetTemplateId} was not found`);
    this.name = 'SourceTemplateNotFoundError';
  }
}
