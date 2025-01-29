export class TargetTemplateNotFoundError extends Error {
  constructor(targetTemplateId: string) {
    super(`Target template with id ${targetTemplateId} was not found`);
    this.name = 'TargetTemplateNotFoundError';
  }
}
