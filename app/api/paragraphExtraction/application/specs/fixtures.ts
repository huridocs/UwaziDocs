import db from 'api/utils/testing_db';

const targetTemplate = {
  _id: db.id(),
  name: 'Target Template',
  commonProperties: [],
  properties: [
    {
      _id: db.id(),
      label: 'Rich Text',
      name: 'rich_text',
      type: 'markdown',
    },
  ],
};

const sourceTemplate = {
  _id: db.id(),
  name: 'Source Template',
  commonProperties: [],
  properties: [
    {
      _id: db.id(),
      label: 'Text',
      type: 'text',
      name: 'text',
    },
  ],
};

const templates = [targetTemplate, sourceTemplate];

const fixtures = { templates };

export { fixtures, targetTemplate, sourceTemplate };
