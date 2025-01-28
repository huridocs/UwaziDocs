import { ObjectId } from 'mongodb';
import db from 'api/utils/testing_db';
import { DefaultTemplatesDataSource } from 'api/templates.v2/database/data_source_defaults';
import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { PropertyOptions } from 'api/templates.v2/model/Property';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import { createEventEmitterMockAdapter } from 'api/common.v2/infrastructure/event/event-emitter-mock-adapter';
import { CreateTemplateUseCase } from '../CreateTemplate/CreateTemplateUseCase';
import { CreateTemplateInput } from '../CreateTemplate/CreateTemplateUseCaseTypes';

const defaultOptions: PropertyOptions = {
  isFullWidth: true,
  noLabel: false,
  isRequired: true,
  isSortable: false,
  showInCard: true,
  isDefaultFilter: false,
  isFilter: true,
  isPrioritySorting: false,
};

const mongoDefaultOptions = {
  fullWidth: true,
  noLabel: false,
  required: true,
  sortable: false,
  showInCard: true,
  defaultfilter: false,
  filter: true,
  prioritySorting: false,
};

const createInput = (): CreateTemplateInput => ({
  name: 'test template',
  color: 'color',
  isDefault: true,
  properties: [
    {
      ...defaultOptions,
      label: 'Title Common Property',
      type: 'text',
      name: 'title',
      isCommonProperty: true,
    },
    {
      ...defaultOptions,
      label: 'Creation Date Common Property',
      type: 'date',
      name: 'creationDate',
      isCommonProperty: true,
    },
    {
      ...defaultOptions,
      label: 'Edit Date Common Property',
      type: 'date',
      name: 'editDate',
      isCommonProperty: true,
    },
    {
      ...defaultOptions,
      label: 'Custom property',
      type: 'text',
    },
    {
      ...defaultOptions,
      label: 'Custom Date property',
      type: 'date',
    },
    {
      ...defaultOptions,
      label: 'Custom Date Range property',
      type: 'daterange',
    },
    {
      ...defaultOptions,
      label: 'Custom Multi Date property',
      type: 'multidate',
    },
    {
      ...defaultOptions,
      label: 'Custom Multi Date Range property',
      type: 'multidaterange',
    },
    {
      ...defaultOptions,
      label: 'Custom Generated Id',
      type: 'generatedid',
    },
    {
      ...defaultOptions,
      label: 'Custom Geolocation',
      type: 'geolocation',
    },
    {
      ...defaultOptions,
      label: 'Custom Image',
      type: 'image',
      style: 'cover',
    },
    {
      ...defaultOptions,
      label: 'Custom Link',
      type: 'link',
    },
    {
      ...defaultOptions,
      label: 'Custom Markdown',
      type: 'markdown',
    },
    {
      ...defaultOptions,
      label: 'Custom Media',
      type: 'media',
    },
    {
      ...defaultOptions,
      label: 'Custom Multi Select',
      type: 'multiselect',
      content: 'any_content',
    },
    {
      ...defaultOptions,
      label: 'Custom Numeric',
      type: 'numeric',
    },
    {
      ...defaultOptions,
      label: 'Custom Preview',
      type: 'preview',
      style: 'cover',
    },
    {
      ...defaultOptions,
      label: 'Custom Select',
      type: 'select',
      content: 'any_content',
    },
  ],
  isEntityViewPage: false,
});

const createSut = () => ({
  useCase: new CreateTemplateUseCase({
    templatesDS: DefaultTemplatesDataSource(DefaultTransactionManager()),
    settingsDS: DefaultSettingsDataSource(DefaultTransactionManager()),
    eventEmitter: createEventEmitterMockAdapter(),
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
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            name: 'creationDate',
            label: 'Creation Date Common Property',
            type: 'date',
            isCommonProperty: true,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            name: 'editDate',
            label: 'Edit Date Common Property',
            type: 'date',
            isCommonProperty: true,
            ...mongoDefaultOptions,
          },
        ],
        properties: [
          {
            _id: expect.any(ObjectId),
            name: 'custom_property',
            label: 'Custom property',
            type: 'text',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Date property',
            name: 'custom_date_property',
            type: 'date',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Date Range property',
            name: 'custom_date_range_property',
            type: 'daterange',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Multi Date property',
            name: 'custom_multi_date_property',
            type: 'multidate',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Multi Date Range property',
            type: 'multidaterange',
            name: 'custom_multi_date_range_property',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Generated Id',
            type: 'generatedid',
            name: 'custom_generated_id',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Geolocation',
            type: 'geolocation',
            name: 'custom_geolocation_geolocation',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Image',
            type: 'image',
            name: 'custom_image',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Link',
            type: 'link',
            name: 'custom_link',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Markdown',
            type: 'markdown',
            name: 'custom_markdown',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Media',
            type: 'media',
            name: 'custom_media',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Multi Select',
            type: 'multiselect',
            name: 'custom_multi_select',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Numeric',
            type: 'numeric',
            name: 'custom_numeric',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Preview',
            type: 'preview',
            name: 'custom_preview',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
          {
            _id: expect.any(ObjectId),
            label: 'Custom Select',
            type: 'select',
            name: 'custom_select',
            isCommonProperty: false,
            ...mongoDefaultOptions,
          },
        ],
      },
    ]);
  });
});
