import { DefaultTemplatesDataSource } from 'api/templates.v2/database/data_source_defaults';
import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import db from 'api/utils/testing_db';
import { ObjectId } from 'mongodb';
import { CreateTemplate } from '../CreateTemplate/CreateTemplate';

describe('CreateTemplate', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext({ settings: [{ newNameGeneration: false as any }] });
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should create a template', async () => {
    const useCase = new CreateTemplate({
      templatesDS: DefaultTemplatesDataSource(DefaultTransactionManager()),
      settingsDS: DefaultSettingsDataSource(DefaultTransactionManager()),
    });

    const output = await useCase.execute({
      name: 'test template',
      color: 'color',
      default: true,
      commonProperties: [{ label: 'common property', type: 'text' }],
      properties: [{ label: 'property', type: 'text' }],
    });

    const DBtemplates = await db.mongodb?.collection('templates').find().toArray();

    expect(DBtemplates).toEqual([
      {
        _id: expect.any(ObjectId),
        name: output.name,
        color: output.color,
        default: output.isDefault,
        commonProperties: [
          {
            _id: expect.any(ObjectId),
            name: output.commonProperties[0].name,
            label: output.commonProperties[0].label,
            type: output.commonProperties[0].type,
          },
        ],
        properties: [
          {
            _id: expect.any(ObjectId),
            name: output.properties[0].name,
            label: output.properties[0].label,
            type: output.properties[0].type,
          },
        ],
      },
    ]);
  });

  // it('should auto generate names based on labels', () => {
  //   throw new Error('not implemented yet');
  // });

  // it('general refactoring (parameter objects for domain objects)', () => {
  //   throw new Error('not implemented yet');
  // });

  // it('validation using json schemas and ajv like in AT', () => {
  //   throw new Error('not implemented yet');
  // });
});
