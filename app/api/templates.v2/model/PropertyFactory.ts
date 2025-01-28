import { ImageProperty } from './ImageProperty';
import { PreviewProperty } from './PreviewProperty';
import { Property, PropertyOptions } from './Property';
import { PropertyType } from './PropertyType';
import { SelectProperty } from './SelectProperty';

type CreatePropertyInput = {
  id: string;
  label: string;
  type: PropertyType;
  templateId: string;
  shouldGenerateRandomName?: boolean;

  name?: string;
  isCommonProperty?: boolean;
  generatedId?: boolean;
  content?: string;
  relationType?: string;
  inherit?: {
    property: string;
    type: string;
  };

  style?: string;
  nestedProperties?: string[];
  query?: any[];
  denormalizedProperty?: string;
  targetTemplates?: string[];
} & PropertyOptions;

export class PropertyFactory {
  static create(input: CreatePropertyInput) {
    switch (input.type) {
      case 'multiselect':
      case 'select':
        return SelectProperty.create({ ...input, content: input.content! });

      case 'image':
        return ImageProperty.create({ ...input, style: input.style as any });

      case 'preview':
        return PreviewProperty.create({ ...input, style: input.style as any });

      default:
        return Property.create(input);
    }
  }
}
