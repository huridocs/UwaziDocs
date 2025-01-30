export enum PXErrorCode {
  TARGET_TEMPLATE_NOT_FOUND = 'TARGET_TEMPLATE_NOT_FOUND',
  SOURCE_TEMPLATE_NOT_FOUND = 'SOURCE_TEMPLATE_NOT_FOUND',
  TARGET_TEMPLATE_INVALID = 'TARGET_TEMPLATE_INVALID',
  TARGET_SOURCE_TEMPLATE_EQUAL = 'TARGET_SOURCE_TEMPLATE_EQUAL',
}

export class PXValidationError extends Error {
  constructor(
    public code: PXErrorCode,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'PXValidationError';
  }
}
