import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import db from 'api/utils/testing_db';
import { ObjectId } from 'mongodb';
import { CreateTemplate } from '../CreateTemplate';
import { DefaultTemplatesDataSource } from '../database/data_source_defaults';

describe('CreateTemplate', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext({});
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should create a template', async () => {
    const useCase = new CreateTemplate(DefaultTemplatesDataSource(DefaultTransactionManager()));
    await useCase.execute({
      name: 'test template',
      color: 'color',
      default: true,
      // entityViewPage: 'this should be optional',
      commonProperties: [{ label: 'common property', type: 'text' }],
      properties: [],
    });

    const DBtemplates = await db.mongodb?.collection('templates').find().toArray();

    expect(DBtemplates).toEqual([
      {
        _id: expect.any(ObjectId),
        name: 'test template',
        color: 'color',
        default: true,
        // entityViewPage: 'this should be optional',
        commonProperties: [{ _id: expect.any(ObjectId), name: null, label: 'common property', type: 'text' }],
        properties: [],
      },
    ]);
  });

  it('should auto generate names based on labels', () => {
    throw new Error('not implemented yet');
  });

  it('general refactoring (parameter objects for domain objects)', () => {
    throw new Error('not implemented yet');
  });

  it('validation using json schemas and ajv like in AT', () => {
    throw new Error('not implemented yet');
  });
});
