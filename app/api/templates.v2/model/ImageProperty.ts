import { z } from 'zod';
import { CreatePropertyInput, Property, PropertyProps } from './Property';
import { StyleSchema, StyleType } from './StyleType';

type ImagePropertyProps = {
  style: StyleType;
} & Omit<PropertyProps, 'type'>;

type CreateImagePropertyInput = {
  style: StyleType;
} & CreatePropertyInput;

const Schema = z.object({
  style: StyleSchema,
});

export class ImageProperty extends Property {
  readonly style: string;

  constructor({ style, ...rest }: ImagePropertyProps) {
    super({ ...rest, type: 'image' });
    this.style = style;
    this.validate();
  }

  private validate() {
    Schema.parse(this);
  }

  static create({ shouldGenerateRandomName, ...rest }: CreateImagePropertyInput) {
    const name = this.processName({
      shouldGenerateRandomName,
      label: rest.label,
      type: rest.type,
      name: rest.name,
    });

    return new ImageProperty({ ...rest, name });
  }
}
