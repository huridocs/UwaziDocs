import { createDefaultValidator } from 'api/common.v2/validation/ajvInstances';
import { RelationshipInputArraySchema } from './relationshipInputSchemas';
import { RelationshipInputArrayType } from './relationshipInputTypes';

const validateRelationshipInputArray = createDefaultValidator<RelationshipInputArrayType>(
  RelationshipInputArraySchema
);

const validateStringArray = createDefaultValidator<string[]>({
  type: 'array',
  minItems: 1,
  items: { type: 'string' },
});

export { validateRelationshipInputArray, validateStringArray };
