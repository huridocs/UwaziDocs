export class TargetTemplateInvalidError extends Error {
  constructor(targetTemplateId: string) {
    super(
      `Target template with id ${targetTemplateId} should have at least one rich text property`
    );
    this.name = 'TargetTemplateInvalidError';
  }
}
