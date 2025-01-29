import { Template } from 'api/templates.v2/model/Template';
import { TargetTemplateInvalidError } from './TargetTemplateInvalidError';
import { TargetSourceTemplateEqualError } from './TargetSourceTemplateEqualError';

export enum ExtractorStatus {
  Running,
  Idle,
}

export type ExtractorProps = {
  id: string;
  sourceTemplate: Template;
  targetTemplate: Template;
};

export class Extractor {
  id: string;

  targetTemplate: Template;

  sourceTemplate: Template;

  constructor(props: ExtractorProps) {
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
