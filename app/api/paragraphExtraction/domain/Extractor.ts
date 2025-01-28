import { Template } from 'api/templates.v2/model/Template';

export enum ExtractorStatus {
  Running,
  Idle,
}

export type ExtractorProps = {
  sourceTemplate: Template;
  targetTemplate: Template;
  status: ExtractorStatus;
};

export class Extractor {
  targetTemplate: Template;

  sourceTemplate: Template;

  status: ExtractorStatus;

  constructor(props: ExtractorProps) {
    this.targetTemplate = props.targetTemplate;
    this.sourceTemplate = props.sourceTemplate;
    this.status = props.status;

    this.validate();
  }

  private validate() {
    if (!this.targetTemplate.getPropertiesByType('markdown')) {
      throw new Error('Target template should have at least one "markdown" property type');
    }

    if (this.targetTemplate.id === this.sourceTemplate.id) {
      throw new Error('Target and Source template cannot be the same');
    }
  }

  isRunning() {
    return this.status === ExtractorStatus.Running;
  }

  isIdle() {
    return this.status === ExtractorStatus.Idle;
  }

  changeToIdle() {
    this.status = ExtractorStatus.Idle;
  }

  changeToRunning() {
    this.status = ExtractorStatus.Running;
  }
}
