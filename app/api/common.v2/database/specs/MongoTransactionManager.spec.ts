/* eslint-disable max-classes-per-file */
import { Transactional } from 'api/common.v2/contracts/Transactional';
import { TransactionManager } from 'api/common.v2/contracts/TransactionManager';
import { getIdMapper } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import testingDB from 'api/utils/testing_db';
import { ClientSession } from 'mongodb';
import { getClient } from '../getConnectionForCurrentTenant';
import { MongoTransactionManager } from '../MongoTransactionManager';

const ids = getIdMapper();

const fixtures = {
  collection1: [{ _id: ids('doc1'), name: 'doc1' }],
  collection2: [{ _id: ids('doc2'), name: 'doc2' }],
};

beforeEach(async () => {
  await testingEnvironment.setUp(fixtures);
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

abstract class TestBase implements Transactional<ClientSession> {
  protected session?: ClientSession;

  setTransactionContext(session: ClientSession): void {
    this.session = session;
  }

  clearTransactionContext(): void {
    this.session = undefined;
  }
}

class Transactional1 extends TestBase {
  async do() {
    await testingDB.mongodb
      ?.collection('collection1')
      .insertOne({ _id: ids('doc3'), name: 'doc3' }, { session: this.session });
    await testingDB.mongodb
      ?.collection('collection1')
      .updateOne({ _id: ids('doc1') }, { $set: { updated: true } }, { session: this.session });
  }
}

class Transactional2 extends TestBase {
  async do() {
    await testingDB.mongodb
      ?.collection('collection2')
      .deleteOne({ _id: ids('doc2') }, { session: this.session });
  }
}

class Transactional3 extends TestBase {
  async do() {
    return testingDB
      .mongodb!.collection('collection1')
      .find({ _id: ids('doc1') }, { session: this.session })
      .toArray();
  }
}

describe('When every operation goes well', () => {
  let transactionResult: any;
  beforeEach(async () => {
    const transactionManager = new MongoTransactionManager(getClient());
    const source1 = new Transactional1();
    const source2 = new Transactional2();
    const source3 = new Transactional3();
    transactionResult = await transactionManager.run(async () => {
      await source1.do();
      await source2.do();
      const result = await source3.do();

      return result;
    }, [source1, source2, source3]);
  });

  it('should be reflected in all of the collections affected', async () => {
    const col1 = await testingDB.mongodb?.collection('collection1').find({}).toArray();
    const col2 = await testingDB.mongodb?.collection('collection2').find({}).toArray();

    expect(col1).toEqual([
      { _id: ids('doc1'), name: 'doc1', updated: true },
      { _id: ids('doc3'), name: 'doc3' },
    ]);

    expect(col2).toEqual([]);
  });

  it('should return what the callback returned', async () => {
    expect(transactionResult).toEqual([{ _id: ids('doc1'), name: 'doc1', updated: true }]);
  });
});

describe('When one operation fails', () => {
  // eslint-disable-next-line max-statements
  it('should not write any changes to the database and re-throw the error', async () => {
    const transactionManager: TransactionManager = new MongoTransactionManager(getClient());
    const error = new Error('Simulated error');
    const source1 = new Transactional1();
    const source2 = new Transactional2();
    try {
      await transactionManager.run(async () => {
        await source1.do();
        throw error; // Mimics error thrown mid-execution
        // eslint-disable-next-line no-unreachable
        await source2.do();
      }, [source1, source2]);
    } catch (e) {
      expect(e).toBe(error);
    }

    const col1 = await testingDB.mongodb?.collection('collection1').find({}).toArray();
    const col2 = await testingDB.mongodb?.collection('collection2').find({}).toArray();

    expect(col1).toEqual(fixtures.collection1);
    expect(col2).toEqual(fixtures.collection2);
  });
});

describe('when a session is provided', () => {
  it('should use the provided session', async () => {
    const transactionManager: TransactionManager = new MongoTransactionManager(getClient());
    const transactionalDependency: Transactional<string> = {
      setTransactionContext: jest.fn(),
      clearTransactionContext: () => {},
    };

    await transactionManager.run(
      async () => Promise.resolve(),
      [transactionalDependency],
      'dummy transaction context'
    );

    expect(transactionalDependency.setTransactionContext).toHaveBeenCalledWith(
      'dummy transaction context'
    );
  });
});
