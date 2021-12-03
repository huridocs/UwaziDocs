import Ajv from 'ajv';
import { objectIdSchema, tocSchema, extractedMetadataSchema } from 'shared/types/commonSchemas';
import { wrapValidator } from 'shared/tsUtils';
import { FileType } from './fileType';

const emitSchemaTypes = true;

const ajv = Ajv({ allErrors: true, removeAdditional: true });

const fileSchema = {
  $schema: 'http://json-schema.org/schema#',
  $async: true,
  type: 'object',
  additionalProperties: false,
  title: 'FileType',
  definitions: { objectIdSchema, tocSchema, extractedMetadataSchema },
  properties: {
    _id: objectIdSchema,
    entity: { type: 'string', minLength: 1 },
    originalname: { type: 'string', minLength: 1 },
    filename: { type: 'string', minLength: 1 },
    mimetype: { type: 'string', minLength: 1 },
    size: { type: 'number' },
    creationDate: { type: 'number' },
    language: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['custom', 'document', 'thumbnail', 'attachment'] },
    url: { type: 'string', pattern: '^https://' },
    status: { type: 'string', enum: ['processing', 'failed', 'ready'] },
    totalPages: { type: 'number' },
    generatedToc: { type: 'boolean' },
    uploaded: { type: 'boolean' },
    fullText: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^[0-9]+$': { type: 'string' },
      },
    },
    toc: {
      type: 'array',
      items: tocSchema,
    },
    extractedMetadata: { type: 'array', items: extractedMetadataSchema },
    ocrstatus: { type: 'string', enum: ['noOCR', 'inQueue', 'cannotProcess', 'withOCR'] },
  },
};

const validate = wrapValidator(ajv.compile(fileSchema));

const validateFile = async (file: FileType): Promise<FileType> => validate({ ...file });

export { validateFile, fileSchema, emitSchemaTypes };
