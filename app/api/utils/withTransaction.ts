import { dbSessionContext } from 'api/odm/sessionsContext';
import { search } from 'api/search';

interface TransactionOperation {
  abort: () => Promise<void>;
}

const originalIndexEntities = search.indexEntities.bind(search);
search.indexEntities = async (query, select, limit) => {
  if (dbSessionContext.getSession()) {
    return dbSessionContext.registerESIndexOperation([query, select, limit]);
  }
  return originalIndexEntities(query, select, limit);
};

const performDelayedReindexes = async () => {
  await Promise.all(
    dbSessionContext
      .getReindexOperations()
      .map(async reindexArgs => originalIndexEntities(...reindexArgs))
  );
};

const withTransaction = async <T>(
  operation: (context: TransactionOperation) => Promise<T>
): Promise<T> => {
  const session = await dbSessionContext.startSession();
  session.startTransaction();
  let wasManuallyAborted = false;

  const context: TransactionOperation = {
    abort: async () => {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      wasManuallyAborted = true;
    },
  };

  try {
    const result = await operation(context);
    if (!wasManuallyAborted) {
      await session.commitTransaction();
      dbSessionContext.clearSession();
      await performDelayedReindexes();
    }
    return result;
  } catch (e) {
    if (!wasManuallyAborted) {
      await session.abortTransaction();
    }
    throw e;
  } finally {
    dbSessionContext.clearSession();
    await session.endSession();
  }
};

export { withTransaction };
