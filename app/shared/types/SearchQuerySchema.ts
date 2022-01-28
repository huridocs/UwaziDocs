export const emitSchemaTypes = true;

export const PageSchema = {
  title: 'Page',
  type: 'object',
  additionalProperties: false,
  properties: { limit: { type: 'number' }, offset: { type: 'number' } },
};

export const RangeFilterSchema = {
  title: 'RangeFilter',
  additionalProperties: false,
  properties: { from: { type: 'number' }, to: { type: 'number' } },
};

export const CompoundFilterSchema = {
  title: 'CompoundFilter',
  additionalProperties: false,
  properties: {
    values: { type: 'array', items: { type: 'string' } },
    operator: { type: 'string', enum: ['AND', 'OR'] },
  },
};

export const SearchQuerySchema = {
  title: 'SearchQuery',
  additionalProperties: false,
  properties: {
    page: PageSchema,
    filter: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          RangeFilterSchema,
          CompoundFilterSchema,
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
        ],
      },
      properties: {
        searchString: { type: 'string' },
        sharedId: { type: 'string' },
        published: { type: 'boolean' },
      },
    },
    sort: { type: 'string' },
    fields: { type: 'array', items: { type: 'string', minlength: 1 } },
  },
};
