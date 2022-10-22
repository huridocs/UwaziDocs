import { getClient, getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { TraversalQueryNode } from 'api/relationships.v2/model/TraversalQueryNode';
import { RelationshipProperty } from 'api/templates.v2/model/RelationshipProperty';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { MongoTemplatesDataSource } from '../MongoTemplatesDataSource';
import { mapPropertyQuery } from '../QueryMapper';

const factory = getFixturesFactory();

const createDBRelationshipQuery = (index: number) => [
  {
    types: [factory.id(`type${index}`)],
    direction: 'out' as const,
    match: [
      {
        templates: [factory.id(`template${index}`)],
      },
    ],
  },
];

const createRelationshipQuery = (index: number) =>
  mapPropertyQuery(createDBRelationshipQuery(index));

const fixtures = {
  templates: [
    factory.template('template1', [
      {
        name: 'relationshipProp1',
        type: 'newRelationship',
        label: 'relationshipProp1',
        query: createDBRelationshipQuery(1),
      },
    ]),
    factory.template('template2', [
      {
        name: 'relationshipProp2',
        type: 'newRelationship',
        label: 'relationshipProp2',
        query: createDBRelationshipQuery(2),
      },
    ]),
    factory.template('template3', [
      {
        name: 'relationshipProp3',
        type: 'newRelationship',
        label: 'relationshipProp3',
        query: createDBRelationshipQuery(3),
      },
    ]),
  ],
};

beforeEach(async () => {
  await testingEnvironment.setUp(fixtures);
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

describe('when requesting the relationship properties configured in the system', () => {
  it('should return all the relationship properties', async () => {
    const dataSource = new MongoTemplatesDataSource(
      getConnection(),
      new MongoTransactionManager(getClient())
    );
    const result = await dataSource.getAllRelationshipProperties().all();
    expect(result.length).toBe(3);
    result.forEach(property => {
      expect(property).toBeInstanceOf(RelationshipProperty);
      expect(property.query[0]).toBeInstanceOf(TraversalQueryNode);
    });
    expect(result).toMatchObject([
      {
        name: 'relationshipProp1',
        query: createRelationshipQuery(1),
        template: factory.id('template1').toHexString(),
      },
      {
        name: 'relationshipProp2',
        query: createRelationshipQuery(2),
        template: factory.id('template2').toHexString(),
      },
      {
        name: 'relationshipProp3',
        query: createRelationshipQuery(3),
        template: factory.id('template3').toHexString(),
      },
    ]);
  });
});
