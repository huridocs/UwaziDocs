import { storage } from 'api/files/storage';
import { dbSessionContext } from 'api/odm/sessionsContext';
import { search } from 'api/search';
import { tenants } from 'api/tenants';
import { DefaultLogger } from 'api/log.v2/infrastructure/StandardLogger';
import { inspect } from 'util';

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

const originalStoreFile = storage.storeFile.bind(storage);
storage.storeFile = async (filename, file, type) => {
  if (dbSessionContext.getSession()) {
    return dbSessionContext.registerFileOperation({ filename, file, type });
  }
  return originalStoreFile(filename, file, type);
};

const performDelayedFileStores = async () => {
  await storage.storeMultipleFiles(dbSessionContext.getFileOperations());
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
  const logger = DefaultLogger();

  if (!tenants.current().featureFlags?.v1_transactions) {
    return operation({ abort: async () => {} });
  }
  const session = await dbSessionContext.startSession();
  session.startTransaction();
  let wasManuallyAborted = false;

  const context: TransactionOperation = {
    abort: async () => {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      wasManuallyAborted = true;
      logger.info(
        `[v1_transactions] Transactions was manually aborted, session id -> ${inspect(session.id)}`
      );
    },
  };

  try {
    const result = await operation(context);
    logger.info(
      `[v1_transactions] Transaction operations was successfully completed, session id -> ${inspect(session.id)}`
    );
    if (!wasManuallyAborted) {
      dbSessionContext.clearSession();
      await performDelayedFileStores();
      logger.info(
        `[v1_transactions] Transaction saved all files before session commit, session id -> ${inspect(session.id)}`
      );
      await session.commitTransaction();
      logger.info(
        `[v1_transactions] Transaction session was commited, session id -> ${inspect(session.id)}`
      );
      await performDelayedReindexes();
      logger.info(
        `[v1_transactions] Transaction elasticsearch reindexes after session was commited, session id -> ${inspect(session.id)}`
      );
    }
    return result;
  } catch (e) {
    if (!wasManuallyAborted) {
      logger.info(
        `[v1_transactions] Transaction aborted due to error: ${inspect(e)}, session id -> ${inspect(session.id)}`
      );
      await session.abortTransaction();
    }
    throw e;
  } finally {
    dbSessionContext.clearSession();
    dbSessionContext.clearContext();
    logger.info(
      `[v1_transactions] Transaction cleared all context info, session id -> ${inspect(session.id)}`
    );
    await session.endSession();
    logger.info(
      `[v1_transactions] Transaction session ended, session id -> ${inspect(session.id)}`
    );
  }
};

export { withTransaction };
