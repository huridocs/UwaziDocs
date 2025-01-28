import { z } from 'zod';
import { CreatePropertyInput, Property, PropertyProps } from './Property';

type SelectPropertyProps = {
  content: string;
} & PropertyProps;

type CreateSelectPropertyInput = { content: string } & CreatePropertyInput;

const Schema = z.object({
  content: z
    .string({ message: 'You should provide a "content" in order to create a SelectProperty' })
    .min(1),
  type: z.enum(['select', 'multiselect'], {
    message: 'You should only provide "select" or "multiselect" as type',
  }),
});

export class SelectProperty extends Property {
  readonly content: string;

  constructor({ content, ...rest }: SelectPropertyProps) {
    super(rest);
    this.content = content;
    this.validate();
  }

  private validate() {
    Schema.parse(this);
  }

  static create({ shouldGenerateRandomName, ...rest }: CreateSelectPropertyInput) {
    const name = this.processName({
      shouldGenerateRandomName,
      label: rest.label,
      type: rest.type,
      name: rest.name,
    });

    return new SelectProperty({ ...rest, name });
  }
}
