import { getClient, getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { partialImplementation } from 'api/common.v2/testing/partialImplementation';
import { MongoRelationshipsDataSource } from 'api/relationships.v2/database/MongoRelationshipsDataSource';
import { MongoSettingsDataSource } from 'api/settings.v2/database/MongoSettingsDataSource';
import { MongoTemplatesDataSource } from 'api/templates.v2/database/MongoTemplatesDataSource';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import testingDB from 'api/utils/testing_db';
import { MetadataSchema } from 'shared/types/commonTypes';
import { EntitySchema } from 'shared/types/entityType';
import { MongoEntitiesDataSource } from '../MongoEntitiesDataSource';

const factory = getFixturesFactory();

const entityInLanguages =
  (langs: string[]) =>
  (id: string, template?: string, metadata?: MetadataSchema, props?: EntitySchema) =>
    langs.map(lang => factory.entity(id, template, metadata, { language: lang, ...props }));

const fixtures = {
  entities: [
    ...entityInLanguages(['en', 'pt'])('entity1', 'template1'),
    ...entityInLanguages(['en', 'pt'])('entity2', 'template1'),
    ...entityInLanguages(['en', 'pt'])(
      'entity3',
      'template1',
      {
        relProp1: [{ value: 'valid value', label: 'valid label' }],
        relProp3: [{ value: 'old_value', label: 'old_label' }],
        numeric: [{ value: 1 }],
      },
      { obsoleteMetadata: ['relProp3'] }
    ),
    ...entityInLanguages(['en', 'pt'])(
      'entity4',
      'template1',
      {
        relProp1: [{ value: 'valid value', label: 'valid label' }],
        numeric: [{ value: 1 }],
        relProp4: [
          {
            value: 'old_value',
            label: 'old_label',
            inheritedType: 'numeric',
            inheritedValue: [{ value: 0 }],
          },
        ],
      },
      { obsoleteMetadata: ['relProp4'] }
    ),
    factory.entity(
      'inherit_target_1',
      'template-to-inherit',
      { inherited: [{ value: 1 }] },
      { language: 'en', title: 'inherit_target_1_en' }
    ),
    factory.entity(
      'inherit_target_1',
      'template-to-inherit',
      { inherited: [{ value: 2 }] },
      { language: 'pt', title: 'inherit_target_1_pt' }
    ),
    factory.entity(
      'inherit_target_2',
      'template-to-inherit',
      { inherited: [{ value: 3 }] },
      { language: 'en', title: 'inherit_target_2_en' }
    ),
    factory.entity(
      'inherit_target_2',
      'template-to-inherit',
      { inherited: [{ value: 4 }] },
      { language: 'pt', title: 'inherit_target_2_pt' }
    ),
  ],
  relationships: [
    {
      _id: factory.id('e3_to_it1'),
      from: { entity: 'entity3' },
      to: { entity: 'inherit_target_1' },
      type: factory.id('reltypeid'),
    },
    {
      _id: factory.id('e4_to_it2'),
      from: { entity: 'entity4' },
      to: { entity: 'inherit_target_2' },
      type: factory.id('reltypeid'),
    },
  ],
  relationtypes: [
    {
      _id: factory.id('reltypeid'),
      template: 'reltype',
    },
  ],
  templates: [
    factory.template('template1', [
      { type: 'newRelationship', name: 'relProp1', label: 'relProp1', query: [{}] },
      { type: 'newRelationship', name: 'relProp2', label: 'relProp2', query: [{}] },
      {
        type: 'newRelationship',
        name: 'relProp3',
        label: 'relProp3',
        query: [
          {
            types: [factory.id('reltypeid')],
            direction: 'out',
            match: [{ templates: [factory.id('template-to-inherit')] }],
          },
        ],
      },
      {
        type: 'newRelationship',
        name: 'relProp4',
        label: 'relProp4',
        query: [
          {
            types: [factory.id('reltypeid')],
            direction: 'out',
            match: [{ templates: [factory.id('template-to-inherit')] }],
          },
        ],
        denormalizedProperty: 'inherited',
      },
    ]),
    factory.template('template-to-inherit', [factory.property('inherited', 'numeric')]),
  ],
};

beforeEach(async () => {
  await testingEnvironment.setUp(fixtures);
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

describe('Relationship fields caching strategy', () => {
  describe('When invalidating some field cache', () => {
    it('should invalidate the cache for the provided entity-property pairs in all languages', async () => {
      const relationshipsDsMock = partialImplementation<MongoRelationshipsDataSource>({});
      const settingsDsMock = partialImplementation<MongoSettingsDataSource>({});
      const db = getConnection();
      const transactionManager = new MongoTransactionManager(getClient());
      const ds = new MongoEntitiesDataSource(
        db,
        new MongoTemplatesDataSource(db, transactionManager),
        relationshipsDsMock,
        settingsDsMock,
        transactionManager
      );

      await ds.markMetadataAsChanged([
        { sharedId: 'entity1', property: 'relProp1' },
        { sharedId: 'entity2', property: 'relProp2' },
      ]);

      const entities = await testingDB.mongodb?.collection('entities').find({}).toArray();
      expect(
        entities?.map(e => ({
          sharedId: e.sharedId,
          language: e.language,
          obsoleteMetadata: e.obsoleteMetadata,
        }))
      ).toMatchObject([
        { sharedId: 'entity1', language: 'en', obsoleteMetadata: ['relProp1'] },
        { sharedId: 'entity1', language: 'pt', obsoleteMetadata: ['relProp1'] },
        { sharedId: 'entity2', language: 'en', obsoleteMetadata: ['relProp2'] },
        { sharedId: 'entity2', language: 'pt', obsoleteMetadata: ['relProp2'] },
        { sharedId: 'entity3', language: 'en', obsoleteMetadata: ['relProp3'] },
        { sharedId: 'entity3', language: 'pt', obsoleteMetadata: ['relProp3'] },
        { sharedId: 'entity4', language: 'en', obsoleteMetadata: ['relProp4'] },
        { sharedId: 'entity4', language: 'pt', obsoleteMetadata: ['relProp4'] },
        { sharedId: 'inherit_target_1', language: 'en', obsoleteMetadata: undefined },
        { sharedId: 'inherit_target_1', language: 'pt', obsoleteMetadata: undefined },
        { sharedId: 'inherit_target_2', language: 'en', obsoleteMetadata: undefined },
        { sharedId: 'inherit_target_2', language: 'pt', obsoleteMetadata: undefined },
      ]);
    });
  });

  describe('When loading some entities', () => {
    let entities: any[];
    beforeEach(async () => {
      const settingsDsMock = partialImplementation<MongoSettingsDataSource>({});
      const db = getConnection();
      const tm = new MongoTransactionManager(getClient());
      const ds = new MongoEntitiesDataSource(
        db,
        new MongoTemplatesDataSource(db, tm),
        new MongoRelationshipsDataSource(db, tm),
        settingsDsMock,
        tm
      );

      entities = await ds.getByIds(['entity3', 'entity4']).all();
    });

    it('should use the cached values', async () => {
      expect(entities).toMatchObject([
        {
          sharedId: 'entity3',
          language: 'en',
          metadata: {
            relProp1: [{ value: 'valid value', label: 'valid label' }],
          },
        },
        {
          sharedId: 'entity3',
          language: 'pt',
          metadata: {
            relProp1: [{ value: 'valid value', label: 'valid label' }],
          },
        },
        {
          sharedId: 'entity4',
          language: 'en',
          metadata: {
            relProp1: [{ value: 'valid value', label: 'valid label' }],
          },
        },
        {
          sharedId: 'entity4',
          language: 'pt',
          metadata: {
            relProp1: [{ value: 'valid value', label: 'valid label' }],
          },
        },
      ]);
    });

    it('should recalculate the invalidated values', async () => {
      expect(entities).toMatchObject([
        {
          sharedId: 'entity3',
          language: 'en',
          metadata: {
            relProp3: [{ value: 'inherit_target_1', label: 'inherit_target_1_en' }],
          },
        },
        {
          sharedId: 'entity3',
          language: 'pt',
          metadata: {
            relProp3: [{ value: 'inherit_target_1', label: 'inherit_target_1_pt' }],
          },
        },
        {
          sharedId: 'entity4',
          language: 'en',
          metadata: {
            relProp4: [
              {
                value: 'inherit_target_2',
                label: 'inherit_target_2_en',
                inheritedValue: [{ value: 3 }],
                inheritedType: 'numeric',
              },
            ],
          },
        },
        {
          sharedId: 'entity4',
          language: 'pt',
          metadata: {
            relProp4: [
              {
                value: 'inherit_target_2',
                label: 'inherit_target_2_pt',
                inheritedValue: [{ value: 4 }],
                inheritedType: 'numeric',
              },
            ],
          },
        },
      ]);
    });

    it('should leave other metadata properties untouched', async () => {
      const dbEntities = await testingDB.mongodb
        ?.collection('entities')
        .find({ sharedId: { $in: ['entity3', 'entity4'] } })
        .toArray();
      expect(dbEntities).toMatchObject([
        {
          sharedId: 'entity3',
          language: 'en',
          metadata: {
            numeric: [{ value: 1 }],
          },
        },
        {
          sharedId: 'entity3',
          language: 'pt',
          metadata: {
            numeric: [{ value: 1 }],
          },
        },
        {
          sharedId: 'entity4',
          language: 'en',
          metadata: {
            numeric: [{ value: 1 }],
          },
        },
        {
          sharedId: 'entity4',
          language: 'pt',
          metadata: {
            numeric: [{ value: 1 }],
          },
        },
      ]);
    });
  });
});

describe('When checking for the existence of entities', () => {
  const cases = [
    { ids: [], expected: true },
    { ids: ['entity1'], expected: true },
    { ids: ['entity1', 'entity2'], expected: true },
    { ids: ['entity1', 'non-existing'], expected: false },
    { ids: ['non-existing'], expected: false },
  ];

  it.each(cases)(
    'should return $expected checking for sharedIds in $ids',
    async ({ ids, expected }) => {
      const db = getConnection();
      const transactionManager = new MongoTransactionManager(getClient());
      const ds = new MongoEntitiesDataSource(
        db,
        new MongoTemplatesDataSource(db, transactionManager),
        partialImplementation<MongoRelationshipsDataSource>({}),
        partialImplementation<MongoSettingsDataSource>({
          async getLanguageKeys() {
            return Promise.resolve(['en', 'pt']);
          },
        }),
        transactionManager
      );

      expect(await ds.entitiesExist(ids)).toBe(expected);
    }
  );
});

it('should return the sharedIds of the entities that have a particular id within their denormalized values in a metatata prop', async () => {
  const db = getConnection();
  const transactionManager = new MongoTransactionManager(getClient());
  const ds = new MongoEntitiesDataSource(
    db,
    new MongoTemplatesDataSource(db, transactionManager),
    partialImplementation<MongoRelationshipsDataSource>({}),
    partialImplementation<MongoSettingsDataSource>({
      async getLanguageKeys() {
        return Promise.resolve(['en', 'pt']);
      },
    }),
    transactionManager
  );

  expect(
    await ds
      .getByDenormalizedId(['relProp1', 'relProp2', 'relProp3', 'relProp4'], ['valid value'])
      .all()
  ).toEqual(['entity3', 'entity3', 'entity4', 'entity4']);
});

it('should update the denormalizations value in all related entities', async () => {
  const db = getConnection();
  const transactionManager = new MongoTransactionManager(getClient());
  const ds = new MongoEntitiesDataSource(
    db,
    new MongoTemplatesDataSource(db, transactionManager),
    partialImplementation<MongoRelationshipsDataSource>({}),
    partialImplementation<MongoSettingsDataSource>({
      async getLanguageKeys() {
        return Promise.resolve(['en', 'pt']);
      },
    }),
    transactionManager
  );

  await ds.updateDenormalizedMetadataValues('old_value', 'en', 'new_label', [
    { propertyName: 'relProp3' },
    { propertyName: 'relProp4', value: [{ value: 11 }] },
  ]);

  await ds.updateDenormalizedMetadataValues('valid value', 'en', 'new label', [
    { propertyName: 'relProp1' },
  ]);

  const entities = await testingDB.mongodb
    ?.collection('entities')
    .find({ sharedId: { $in: ['entity3', 'entity4'] } })
    .toArray();

  expect(entities).toMatchObject([
    {
      sharedId: 'entity3',
      language: 'en',
      metadata: {
        relProp1: [{ value: 'valid value', label: 'new label' }],
        relProp3: [{ value: 'old_value', label: 'new_label' }],
      },
    },
    {
      sharedId: 'entity3',
      language: 'pt',
      metadata: {
        relProp1: [{ value: 'valid value', label: 'valid label' }],
        relProp3: [{ value: 'old_value', label: 'old_label' }],
      },
    },
    {
      sharedId: 'entity4',
      language: 'en',
      metadata: {
        relProp1: [{ value: 'valid value', label: 'new label' }],
        relProp4: [
          {
            value: 'old_value',
            label: 'new_label',
            inheritedType: 'numeric',
            inheritedValue: [{ value: 11 }],
          },
        ],
      },
    },
    {
      sharedId: 'entity4',
      language: 'pt',
      metadata: {
        relProp1: [{ value: 'valid value', label: 'valid label' }],
        relProp4: [
          {
            value: 'old_value',
            label: 'old_label',
            inheritedType: 'numeric',
            inheritedValue: [{ value: 0 }],
          },
        ],
      },
    },
  ]);
});
