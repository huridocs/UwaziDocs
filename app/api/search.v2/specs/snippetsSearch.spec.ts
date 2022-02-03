import qs from 'qs';
import request from 'supertest';
import { Application } from 'express';
import { setUpApp } from 'api/utils/testingRoutes';
import { searchRoutes } from 'api/search.v2/routes';
import { testingDB } from 'api/utils/testing_db';
import { fixturesSnippetsSearch, entity1enId } from 'api/search.v2/specs/snippetsSearchFixtures';
import {loadFetchedInReduxForm} from "app/Metadata/actions/actions";

describe('searchSnippets', () => {
  const app: Application = setUpApp(searchRoutes);

  beforeAll(async () => {
    await testingDB.setupFixturesAndContext(fixturesSnippetsSearch, 'entities.v2.snippets_search');
  });

  afterAll(async () => testingDB.disconnect());

  async function searchEntitySnippets(sharedId: string, searchString: string) {
    return request(app)
      .get('/api/v2/entities')
      .query(qs.stringify({ filter: { sharedId, searchString }, fields: ['snippets'] }))
      .expect(200);
  }

  it('should return fullText snippets of an entity', async () => {
    const { body } = await searchEntitySnippets('entity1SharedId', 'fullText:(searched)');
    const snippets = body.data;
    const matches = expect.stringContaining('<b>searched</b>');
    const expected = [
      expect.objectContaining({
        snippets: {
          count: 2,
          metadata: [],
          fullText: [
            { page: 2, text: matches },
            { page: 4, text: matches },
          ],
        },
      }),
    ];
    expect(snippets).toEqual(expected);
  });

  it.each`
    searchString             | firstResultSharedId  | total
    ${'fullText:(searched)'} | ${'entity1SharedId'} | ${2}
    ${'title:(private)'}     | ${'entity3SharedId'} | ${1}
    ${'private'}             | ${'entity3SharedId'} | ${1}
    ${'"entity:with"'}       | ${'entity4SharedId'} | ${1}
    ${undefined}             | ${'entity1SharedId'} | ${4}
  `(
    'should not return snippets if they are not requested for $searchString',
    async ({ searchString, firstResultSharedId, total }) => {
      const { body } = await request(app)
        .get('/api/v2/entities')
        .query({ filter: { searchString } })
        .expect(200);
      expect(body.data.length).toBe(total);
      const [entity] = body.data;
      expect(entity.sharedId).toEqual(firstResultSharedId);
      expect(entity.snippets).toBeUndefined();
    }
  );

  it('should not return entities if no fullText search matches', async () => {
    const { body } = await searchEntitySnippets('entity1SharedId', 'fullText:(nonexistent)');
    expect(body.data.length).toBe(0);
  });

  it('should support no valid lucene syntax', async () => {
    try {
      const { body } = await searchEntitySnippets('entity3SharedId', 'fulltext OR');
      expect(body.data.length).toBe(1);
    } catch (e) {
      fail('should not throw an exception');
    }
  });

  it('should return a simple search if search term contains :', async () => {
    const { body } = await searchEntitySnippets('entity4SharedId', 'fullText:("searched:term")');
    expect(body.data.length).toBe(1);
    const expected = [
      expect.objectContaining({
        snippets: {
          count: 1,
          metadata: [],
          fullText: [{ page: 2, text: expect.stringContaining('<b>searched:term</b>') }],
        },
      }),
    ];
    expect(body.data).toEqual(expected);
  });

  it('should return snippets in conjunction with other fields asked', async () => {
    const { body } = await request(app)
      .get('/api/v2/entities')
      .query(
        qs.stringify({
          filter: { sharedId: 'entity1SharedId', searchString: 'fullText:(searched)' },
          fields: ['title', 'template', 'snippets'],
        })
      )
      .expect(200);
    const expected = [
      {
        _id: entity1enId.toString(),
        title: 'entity with a document',
        snippets: {
          count: 2,
          metadata: [],
          fullText: [
            { page: 2, text: expect.stringContaining('<b>searched</b>') },
            { page: 4, text: expect.stringContaining('<b>searched</b>') },
          ],
        },
      },
    ];
    expect(body.data).toEqual(expected);
  });

  it('should return title snippets of an entity', async () => {
    const expected = [
      {
        snippets: {
          count: 1,
          metadata: [
            {
              field: 'title',
              texts: ['<b>entity:with</b> a document'],
            },
          ],
        },
      },
    ];
    const { body } = await request(app)
      .get('/api/v2/entities')
      .query(qs.stringify({ filter: { searchString: 'title:("entity:with")' }, fields: ['snippets', 'title'] }))
      .expect(200);
    const snippets = body.data;
    expect(snippets).toMatchObject(expected);
  });
});
