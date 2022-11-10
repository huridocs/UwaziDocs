import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { setUpApp } from 'api/utils/testingRoutes';
import testingDB from 'api/utils/testing_db';
import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import routes from '../routes';

const URL = '/api/v2/relationships';

const factory = getFixturesFactory();

const fixtures = {
  entities: [
    factory.entity(
      'entity1',
      'template1',
      {},
      { permissions: [{ refId: factory.id('group1'), type: 'group', level: 'write' }] }
    ),
    factory.entity(
      'entity2',
      'template1',
      {},
      { permissions: [{ refId: factory.id('user1'), type: 'user', level: 'write' }] }
    ),
  ],
  relationtypes: [{ _id: factory.id('type1') }, { _id: factory.id('type2') }],
  relationships: [
    {
      _id: factory.id('relationship1'),
      from: 'entity1',
      to: 'entity2',
      type: factory.id('type2'),
    },
  ],
  settings: [
    {
      _id: factory.id('settings'),
      languages: [{ key: 'es', default: true, label: 'es' }],
      features: {
        newRelationships: true,
      },
    },
  ],
};

beforeEach(async () => {
  await testingEnvironment.setUp(fixtures);
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

describe('POST relationships', () => {
  it('should should throw a 404 if the feature toggle is not active', async () => {
    await testingDB.mongodb
      ?.collection('settings')
      .updateOne({ _id: factory.id('settings') }, { $set: { features: {} } });

    const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = undefined;
      next();
    });

    await request(app).post(URL).send([]).expect(404);
  });

  const cases = [
    { from: 'entity1', to: 'entity2', type: 'some_type' },
    'random string',
    [],
    [{ property: 'non relationship object' }],
    undefined,
  ];

  it.each(cases)(
    'shuold throw a validation error if the input is not an array. Case %#',
    async input => {
      const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
        (req as any).user = { _id: factory.id('admin_user'), role: 'admin' };
        next();
      });

      await request(app).post(URL).send(input).expect(422);
    }
  );

  const cases1 = [
    { user: undefined, pass: false },
    {
      user: {
        _id: factory.id('user1'),
        role: 'collaborator',
        groups: [{ _id: factory.id('group1'), name: 'group1' }],
      },
      pass: true,
    },
  ];

  it.each(cases1)(
    'should validate the user access on the entities. Case %#',
    async ({ user, pass }) => {
      const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
        (req as any).user = user;
        next();
      });

      await request(app)
        .post(URL)
        .send([{ from: 'entity1', to: 'entity2', type: factory.id('type1').toHexString() }])
        .expect(pass ? 200 : 401);
    }
  );

  it('should create the relationships', async () => {
    const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { _id: factory.id('admin_user'), role: 'admin' };
      next();
    });

    const response = await request(app)
      .post(URL)
      .send([
        { from: 'entity1', to: 'entity2', type: factory.id('type1').toHexString() },
        { from: 'entity2', to: 'entity1', type: factory.id('type1').toHexString() },
      ]);

    const onDb = await testingDB.mongodb
      ?.collection('relationships')
      .find({ type: factory.id('type1') }, { sort: 'from' })
      .toArray();

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject([
      {
        _id: onDb![0]._id.toHexString(),
        from: 'entity1',
        to: 'entity2',
        type: factory.id('type1').toHexString(),
      },
      {
        _id: onDb![1]._id.toHexString(),
        from: 'entity2',
        to: 'entity1',
        type: factory.id('type1').toHexString(),
      },
    ]);

    expect(onDb!.length).toBe(2);
  });
});

describe('DELETE relationships', () => {
  it('should should throw a 404 if the feature toggle is not active', async () => {
    await testingDB.mongodb
      ?.collection('settings')
      .updateOne({ _id: factory.id('settings') }, { $set: { features: {} } });

    const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = undefined;
      next();
    });

    await request(app)
      .delete(URL)
      .query({ ids: [factory.id('relationship1')] })
      .expect(404);
  });

  const cases = [
    { from: 'entity1', to: 'entity2', type: 'some_type' },
    [],
    [{ property: 'non relationship object' }],
    undefined,
  ];

  it.each(cases)(
    'shuold throw a validation error if the input is not an array of strings. Case %#',
    async input => {
      const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
        (req as any).user = { _id: factory.id('admin_user'), role: 'admin' };
        next();
      });

      await request(app).delete(URL).query({ ids: input }).expect(422);
    }
  );

  const cases1 = [
    { user: undefined, pass: false },
    {
      user: {
        _id: factory.id('user1'),
        role: 'collaborator',
        groups: [{ _id: factory.id('group1'), name: 'group1' }],
      },
      pass: true,
    },
  ];

  it.each(cases1)(
    'should validate the user access on the entities. Case %#',
    async ({ user, pass }) => {
      const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
        (req as any).user = user;
        next();
      });

      await request(app)
        .delete(URL)
        .query({
          ids: [factory.id('relationship1').toHexString()],
        })
        .expect(pass ? 200 : 401);
    }
  );

  it('should delete the relationship', async () => {
    const app = setUpApp(routes, (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { _id: factory.id('admin_user'), role: 'admin' };
      next();
    });

    await request(app)
      .delete(URL)
      .query({ ids: [factory.id('relationship1').toHexString()] })
      .expect(200);

    expect(
      (
        await testingDB.mongodb
          ?.collection('relationships')
          .find({ _id: factory.id('relationship1') })
          .toArray()
      )?.length
    ).toBe(0);
  });
});
