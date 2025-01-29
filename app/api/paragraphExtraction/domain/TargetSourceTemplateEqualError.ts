export class TargetSourceTemplateEqualError extends Error {
  constructor() {
    super('Target and Source template cannot be the same');
    this.name = 'TargetSourceTemplateEqualError';
  }
}
