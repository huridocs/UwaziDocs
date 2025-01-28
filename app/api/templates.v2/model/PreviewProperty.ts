import { z } from 'zod';
import { CreatePropertyInput, Property, PropertyProps } from './Property';
import { StyleSchema, StyleType } from './StyleType';

type PreviewPropertyProps = {
  style: StyleType;
} & Omit<PropertyProps, 'type'>;

type CreatePreviewPropertyInput = {
  style: StyleType;
} & CreatePropertyInput;

const Schema = z.object({
  style: StyleSchema,
});

export class PreviewProperty extends Property {
  readonly style: string;

  constructor({ style, ...rest }: PreviewPropertyProps) {
    super({ ...rest, type: 'preview' });
    this.style = style;
    this.validate();
  }

  private validate() {
    Schema.parse(this);
  }

  static create({ shouldGenerateRandomName, ...rest }: CreatePreviewPropertyInput) {
    const name = this.processName({
      shouldGenerateRandomName,
      label: rest.label,
      type: rest.type,
      name: rest.name,
    });

    return new PreviewProperty({ ...rest, name });
  }
}
