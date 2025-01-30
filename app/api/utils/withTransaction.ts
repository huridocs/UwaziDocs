import { dbSessionContext } from 'api/odm/sessionsContext';

interface TransactionOperation {
  abort: () => Promise<void>;
}

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
