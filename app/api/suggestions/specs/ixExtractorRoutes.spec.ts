import { Application } from 'express';
import { Db } from 'mongodb';
import request from 'supertest';

import { getFixturesFactory } from 'api/utils/fixturesFactory';
import testingDB, { DBFixture } from 'api/utils/testing_db';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { setUpApp } from 'api/utils/testingRoutes';
import { UserRole } from 'shared/types/userSchema';
import { extractorsRoutes } from '../extractorsRoutes';

const adminUser = {
  username: 'User 1',
  role: UserRole.ADMIN,
  email: 'user@test.com',
};

const app: Application = setUpApp(extractorsRoutes, (req, _res, next) => {
  req.user = adminUser;
  next();
});

const fixturesFactory = getFixturesFactory();

const extractorToUpdate = {
  _id: fixturesFactory.id('extractor1'),
  name: 'ext1',
  property: 'text_property',
  templates: [fixturesFactory.id('template1')],
};

const existingExtractors = [
  extractorToUpdate,
  {
    _id: fixturesFactory.id('extractor2'),
    name: 'ext2',
    property: 'text_property',
    templates: [fixturesFactory.id('template1')],
  },
  {
    _id: fixturesFactory.id('extractor3'),
    name: 'ext3',
    property: 'text_property',
    templates: [fixturesFactory.id('template1')],
  },
];

const fixtures: DBFixture = {
  settings: [
    {
      languages: [
        {
          default: true,
          key: 'en',
          label: 'English',
        },
        {
          key: 'es',
          label: 'Spanish',
        },
      ],
      features: {
        metadataExtraction: {
          url: 'https://metadataextraction.com',
        },
      },
    },
  ],
  templates: [
    fixturesFactory.template('template1', [
      fixturesFactory.property('text_property', 'text'),
      fixturesFactory.property('number_property', 'numeric'),
      fixturesFactory.property('other_text_property', 'text'),
    ]),
    fixturesFactory.template('template2', [
      fixturesFactory.property('text_property', 'text'),
      fixturesFactory.property('number_property', 'numeric'),
    ]),
  ],
  ixextractors: existingExtractors,
};

describe('extractor routes', () => {
  let db: Db | null;

  beforeEach(async () => {
    await testingEnvironment.setUp(fixtures);
    db = testingDB.mongodb;
  });

  afterAll(async () => {
    await testingEnvironment.tearDown();
  });

  describe('POST /api/ixextractors', () => {
    it.each([
      {
        reason: 'non existing template',
        expectedMessage: 'Missing template.',
        input: {
          name: 'extr1',
          property: 'text_property',
          templates: [
            fixturesFactory.id('template1').toString(),
            fixturesFactory.id('non_existing_template').toString(),
          ],
        },
      },
      {
        reason: 'non existing non existing property (in template)',
        expectedMessage: 'Missing property.',
        input: {
          name: 'extr1',
          property: 'other_text_property',
          templates: [
            fixturesFactory.id('template1').toString(),
            fixturesFactory.id('template2').toString(),
          ],
        },
      },
    ])('should reject $reason', async ({ input, expectedMessage }) => {
      const response = await request(app).post('/api/ixextractors').send(input).expect(500);
      expect(response.body.error).toBe(expectedMessage);
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.length).toBe(3);
    });

    it.each([
      {
        input: {
          name: 'extr1',
          property: 'text_property',
          templates: [
            fixturesFactory.id('template1').toString(),
            fixturesFactory.id('template2').toString(),
          ],
        },
        expectedInDb: {
          name: 'extr1',
          property: 'text_property',
          templates: [fixturesFactory.id('template1'), fixturesFactory.id('template2')],
        },
      },
      {
        input: {
          name: 'extr2',
          property: 'number_property',
          templates: [fixturesFactory.id('template2').toString()],
        },
        expectedInDb: {
          name: 'extr2',
          property: 'number_property',
          templates: [fixturesFactory.id('template2')],
        },
      },
    ])('should create and return extractor', async ({ input, expectedInDb }) => {
      const response = await request(app).post('/api/ixextractors').send(input).expect(200);

      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.[3]).toMatchObject(expectedInDb);

      expect(response.body).toMatchObject(input);
    });
  });

  describe('PUT /api/ixextractors', () => {
    it.each([
      {
        reason: 'non existing _id',
        expectedMessage: 'Missing extractor.',
        change: {
          _id: fixturesFactory.id('non_existing_extractor').toString(),
        },
      },
      {
        reason: 'non existing template',
        expectedMessage: 'Missing template.',
        change: {
          templates: [
            fixturesFactory.id('template1'),
            fixturesFactory.id('non_existing_template').toString(),
          ],
        },
      },
      {
        reason: 'non existing non existing property (in template)',
        expectedMessage: 'Missing property.',
        change: {
          property: 'non-existing-property',
        },
      },
    ])('should reject $reason', async ({ change, expectedMessage }) => {
      const input: any = { ...extractorToUpdate, ...change };
      const response = await request(app).put('/api/ixextractors').send(input).expect(500);
      expect(response.body.error).toBe(expectedMessage);
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.[0]).toMatchObject(extractorToUpdate);
    });

    it.each([
      {
        updateTarget: 'name',
        change: {
          name: 'new_extractor_name',
        },
      },
      {
        updateTarget: 'property',
        change: {
          property: 'number_property',
        },
      },
      {
        updateTarget: 'adding template',
        change: {
          templates: [fixturesFactory.id('template1'), fixturesFactory.id('template2')],
        },
      },
      {
        updateTarget: 'changing template',
        change: {
          templates: [fixturesFactory.id('template2')],
        },
      },
      {
        updateTarget: 'everything',
        change: {
          name: 'new_extractor_name',
          property: 'number_property',
          templates: [fixturesFactory.id('template2')],
        },
      },
    ])('should update $updateTarget', async ({ change }) => {
      const input: any = { ...extractorToUpdate, ...change };
      const response = await request(app).put('/api/ixextractors').send(input).expect(200);
      expect(response.body).toMatchObject(input);
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.[0]).toMatchObject(input);
    });
  });

  describe('DELETE /api/ixextractors', () => {
    it('should reject malformed input', async () => {
      const input = {
        ids: { _id: { $exists: 1 } },
      };
      const response = await request(app).delete('/api/ixextractors').query(input).expect(400);
      expect(response.body.error).toContain('validation failed');
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.length).toBe(3);
    });

    it('should reject non existing _id', async () => {
      const input = {
        ids: [
          fixturesFactory.id('extractor1').toString(),
          fixturesFactory.id('non-existing-extractor').toString(),
        ],
      };
      const response = await request(app).delete('/api/ixextractors').query(input).expect(500);
      expect(response.body.error).toBe('Missing extractor.');
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.length).toBe(3);
    });

    it('should delete extractor', async () => {
      const input = {
        ids: [
          fixturesFactory.id('extractor1').toString(),
          fixturesFactory.id('extractor2').toString(),
        ],
      };
      await request(app).delete('/api/ixextractors').query(input).expect(200);
      const extractors = await db?.collection('ixextractors').find().toArray();
      expect(extractors?.length).toBe(1);
    });
  });

  describe('GET /api/ixextractors', () => {
    it('should return all extractors', async () => {
      const response = await request(app).get('/api/ixextractors').expect(200);
      expect(response.body).toMatchObject([
        { ...existingExtractors[0], _id: existingExtractors[0]._id.toString() },
        { ...existingExtractors[1], _id: existingExtractors[1]._id.toString() },
        { ...existingExtractors[2], _id: existingExtractors[2]._id.toString() },
      ]);
    });
    it('should return an extractor based on a query filter', async () => {
      const response = await request(app)
        .get('/api/ixextractors')
        .query({ id: fixturesFactory.id('extractor1').toString() })
        .expect(200);
      expect(response.body).toMatchObject([existingExtractors[0]]);
    });
  });
});
