import { ObjectId } from 'mongodb';
import db from 'api/utils/testing_db';
import { DefaultTemplatesDataSource } from 'api/templates.v2/database/data_source_defaults';
import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import { CreateTemplateUseCase } from '../CreateTemplate/CreateTemplateUseCase';
import { CreateTemplateInput } from '../CreateTemplate/CreateTemplateUseCaseTypes';

const createInput = (): CreateTemplateInput => ({
  name: 'test template',
  color: 'color',
  isDefault: true,
  properties: [
    { label: 'Title Common Property', type: 'text', name: 'title', isCommonProperty: true },
    {
      label: 'Creation Date Common Property',
      type: 'date',
      name: 'creationDate',
      isCommonProperty: true,
    },
    { label: 'Edit Date Common Property', type: 'date', name: 'editDate', isCommonProperty: true },
    { label: 'Custom property', type: 'text' },
  ],
  isEntityViewPage: false,
});

const createSut = () => ({
  useCase: new CreateTemplateUseCase({
    templatesDS: DefaultTemplatesDataSource(DefaultTransactionManager()),
    settingsDS: DefaultSettingsDataSource(DefaultTransactionManager()),
    eventEmitter: { emit: jest.fn(), listen: jest.fn() } as any,
  }),
});

describe('CreateTemplate', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext({ settings: [{ newNameGeneration: false as any }] });
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should create a template', async () => {
    const { useCase } = createSut();

    await useCase.execute(createInput());

    const DBtemplates = await db.mongodb?.collection('templates').find().toArray();

    expect(DBtemplates).toEqual([
      {
        _id: expect.any(ObjectId),
        name: 'test template',
        color: 'color',
        default: true,
        commonProperties: [
          {
            _id: expect.any(ObjectId),
            name: 'title',
            label: 'Title Common Property',
            type: 'text',
            isCommonProperty: true,
            fullWidth: null,
            noLabel: null,
            required: null,
            sortable: null,
            showInCard: null,
            defaultfilter: null,
            filter: null,
            prioritySorting: null,
          },
          {
            _id: expect.any(ObjectId),
            name: 'creationDate',
            label: 'Creation Date Common Property',
            type: 'date',
            isCommonProperty: true,
            fullWidth: null,
            noLabel: null,
            required: null,
            sortable: null,
            showInCard: null,
            defaultfilter: null,
            filter: null,
            prioritySorting: null,
          },
          {
            _id: expect.any(ObjectId),
            name: 'editDate',
            label: 'Edit Date Common Property',
            type: 'date',
            isCommonProperty: true,
            fullWidth: null,
            noLabel: null,
            required: null,
            sortable: null,
            showInCard: null,
            defaultfilter: null,
            filter: null,
            prioritySorting: null,
          },
        ],
        properties: [
          {
            _id: expect.any(ObjectId),
            name: 'custom_property',
            label: 'Custom property',
            type: 'text',
            isCommonProperty: false,
            fullWidth: null,
            noLabel: null,
            required: null,
            sortable: null,
            showInCard: null,
            defaultfilter: null,
            filter: null,
            prioritySorting: null,
          },
        ],
      },
    ]);
  });
});
