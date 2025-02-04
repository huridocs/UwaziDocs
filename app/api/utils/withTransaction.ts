import { storage } from 'api/files/storage';
import { dbSessionContext } from 'api/odm/sessionsContext';
import { search } from 'api/search';
import { appContext } from './AppContext';
import { tenants } from 'api/tenants';

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
  if (dbSessionContext.getSession() && !appContext.get('fileOperationsNow')) {
    return dbSessionContext.registerFileOperation({ filename, file, type });
  }
  return originalStoreFile(filename, file, type);
};

const performDelayedFileStores = async () => {
  appContext.set('fileOperationsNow', true);
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
    },
  };

  try {
    const result = await operation(context);
    if (!wasManuallyAborted) {
      await performDelayedFileStores();
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
    appContext.set('fileOperationsNow', false);
    dbSessionContext.clearSession();
    await session.endSession();
  }
};

export { withTransaction };
