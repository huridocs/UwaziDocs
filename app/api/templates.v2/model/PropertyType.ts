import { z } from 'zod';

type PropertyType = z.infer<typeof PropertyTypeSchema>;

const PropertyTypeSchema = z.enum([
  'date',
  'daterange',
  'geolocation',
  'image',
  'link',
  'markdown',
  'media',
  'multidate',
  'multidaterange',
  'multiselect',
  'nested',
  'numeric',
  'preview',
  'relationship',
  'select',
  'text',
  'generatedid',
  'newRelationship',
]);

export { PropertyTypeSchema };
export type { PropertyType };
