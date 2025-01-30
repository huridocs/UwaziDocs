import { Template } from 'api/templates.v2/model/Template';
import { TargetTemplateInvalidError } from './TargetTemplateInvalidError';
import { TargetSourceTemplateEqualError } from './TargetSourceTemplateEqualError';

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
      throw new TargetTemplateInvalidError(this.targetTemplate.id);
    }

    if (this.targetTemplate.id === this.sourceTemplate.id) {
      throw new TargetSourceTemplateEqualError();
    }
  }
}
