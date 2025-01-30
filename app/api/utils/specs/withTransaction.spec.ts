import { instanceModel } from 'api/odm/model';
import { dbSessionContext } from 'api/odm/sessionsContext';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { withTransaction } from 'api/utils/withTransaction';
import { ClientSession } from 'mongodb';
import { Schema } from 'mongoose';
import { appContext } from '../AppContext';

interface TestDoc {
  title: string;
  value?: number;
}

describe('withTransaction utility', () => {
  let model: any;

  beforeAll(async () => {
    const schema = new Schema({
      title: String,
      value: Number,
    });
    model = instanceModel<TestDoc>('transactiontest', schema);
  });

  beforeEach(async () => {
    await testingEnvironment.setUp({ transactiontests: [] });
    testingEnvironment.unsetFakeContext();
  });

  afterAll(async () => {
    await testingEnvironment.tearDown();
  });

  it('should commit transaction when operation succeeds', async () => {
    await appContext.run(async () => {
      await withTransaction(async () => {
        await model.save({ title: 'test1', value: 1 });
      });

      const docs = await model.get({ title: 'test1' });
      expect(docs[0]).toBeTruthy();
      expect(docs[0].value).toBe(1);
    });
  });

  it('should rollback transaction when operation fails', async () => {
    await appContext.run(async () => {
      let errorThrown;
      try {
        await withTransaction(async () => {
          await model.save({ title: 'test2', value: 2 });
          throw new Error('Intentional error');
        });
      } catch (error) {
        errorThrown = error;
      }

      expect(errorThrown.message).toBe('Intentional error');

      const docs = await model.get({ title: 'test2' });
      expect(docs).toHaveLength(0);
    });
  });

  it('should handle nested operations in transaction', async () => {
    await appContext.run(async () => {
      await withTransaction(async () => {
        await model.save({ title: 'doc1', value: 1 });
        await model.save({ title: 'doc2', value: 2 });
        await model.updateMany({ value: 1 }, { $set: { value: 3 } });
      });

      const docs = await model.get({}, '', { sort: { title: 1 } });
      expect(docs).toHaveLength(2);
      expect(docs[0].value).toBe(3);
      expect(docs[1].value).toBe(2);
    });
  });

  it('should properly clean up session after transaction', async () => {
    await appContext.run(async () => {
      await withTransaction(async () => {
        await model.save({ title: 'test3' });
      });

      const session = dbSessionContext.getSession();
      expect(session).toBeUndefined();
    });
  });

  it('should maintain session context during transaction', async () => {
    await appContext.run(async () => {
      await withTransaction(async () => {
        const session = dbSessionContext.getSession();
        expect(session).toBeTruthy();
        expect(session?.inTransaction()).toBe(true);

        await model.save({ title: 'test4' });
        expect(dbSessionContext.getSession()).toBe(session);
      });
    });
  });

  it('should handle concurrent transactions', async () => {
    await appContext.run(async () => {
      const transaction1 = withTransaction(async () => {
        await model.save({ title: 'concurrent1', value: 1 });
        return 'tx1';
      });

      const transaction2 = withTransaction(async () => {
        await model.save({ title: 'concurrent2', value: 2 });
        return 'tx2';
      });

      const [result1, result2] = await Promise.all([transaction1, transaction2]);
      expect(result1).toBe('tx1');
      expect(result2).toBe('tx2');

      const docs = await model.get({}, '', { sort: { title: 1 } });
      expect(docs).toHaveLength(2);
      expect(docs[0].title).toBe('concurrent1');
      expect(docs[1].title).toBe('concurrent2');
    });
  });

  it('should properly abort concurrent transactions', async () => {
    await appContext.run(async () => {
      await withTransaction(async () => {
        await model.save({ title: 'concurrent', value: 2 });
      });

      let error;
      try {
        await withTransaction(async () => {
          await model.save({ title: 'abort1', value: 1 });
          throw new Error('Abort transaction 1');
        });
      } catch (e) {
        error = e;
      }

      expect(error?.message).toBe('Abort transaction 1');

      const docs = await model.get({});
      expect(docs).toMatchObject([{ title: 'concurrent' }]);
    });
  });

  describe('manual abort', () => {
    it('should allow manual abort without throwing error', async () => {
      await appContext.run(async () => {
        await withTransaction(async ({ abort }) => {
          await model.save({ title: 'manual-abort', value: 1 });
          await abort();
        });

        const session = dbSessionContext.getSession();
        expect(session).toBeUndefined();
        const docs = await model.get({ title: 'manual-abort' });
        expect(docs).toHaveLength(0);
      });
    });

    it('should clean up session after manual abort', async () => {
      await appContext.run(async () => {
        await withTransaction(async ({ abort }) => {
          const sessionBeforeAbort = dbSessionContext.getSession();
          expect(sessionBeforeAbort).toBeTruthy();
          expect(sessionBeforeAbort?.inTransaction()).toBe(true);

          await model.save({ title: 'session-cleanup', value: 1 });
          await abort();
        });

        expect(dbSessionContext.getSession()).toBeUndefined();
        const docs = await model.get({ title: 'session-cleanup' });
        expect(docs).toHaveLength(0);
      });
    });

    it('should abort transaction even if subsequent operations fail', async () => {
      await appContext.run(async () => {
        let error;
        try {
          await withTransaction(async ({ abort }) => {
            await model.save({ title: 'abort-then-error', value: 1 });
            await abort();
            throw new Error('Subsequent error');
          });
        } catch (e) {
          error = e;
        }

        expect(error?.message).toBe('Subsequent error');
        const docs = await model.get({ title: 'abort-then-error' });
        expect(docs).toHaveLength(0);
      });
    });

    it('should end session after abort', async () => {
      await appContext.run(async () => {
        let sessionToTest: ClientSession | undefined;
        await withTransaction(async ({ abort }) => {
          sessionToTest = dbSessionContext.getSession();
          await model.save({ title: 'session-ended', value: 1 });
          await abort();
        });

        expect(sessionToTest?.hasEnded).toBe(true);
      });
    });
  });
});
