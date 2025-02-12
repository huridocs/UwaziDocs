import { Entity } from 'api/entities.v2/model/Entity';
import { Template } from 'api/templates.v2/model/Template';
import { PXValidationError, PXErrorCode } from './PXValidationError';

export type PXExtractorProps = {
  id: string;
  sourceTemplate: Template;
  targetTemplate: Template;
};

export class PXExtractor {
  id: string;

  targetTemplate: Template;

  sourceTemplate: Template;

  constructor(props: PXExtractorProps) {
    this.id = props.id;
    this.targetTemplate = props.targetTemplate;
    this.sourceTemplate = props.sourceTemplate;

    this.validate();
  }

  private validate() {
    if (!this.targetTemplate.getPropertiesByType('markdown').length) {
      throw new PXValidationError(
        PXErrorCode.TARGET_TEMPLATE_INVALID,
        `Target template with id ${this.targetTemplate.id} should have at least one rich text property`
      );
    }

    if (this.targetTemplate.id === this.sourceTemplate.id) {
      throw new PXValidationError(
        PXErrorCode.TARGET_SOURCE_TEMPLATE_EQUAL,
        'Target and Source template cannot be the same'
      );
    }
  }

  canExtract(entity: Entity) {
    return this.sourceTemplate.id === entity.template;
  }
}
