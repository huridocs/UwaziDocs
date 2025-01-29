import entities from 'api/entities/entities';
import { dbSessionContext } from 'api/odm/sessionsContext';
import { search } from 'api/search';
import { appContext } from 'api/utils/AppContext';

// const indexEntities = search.indexEntities.bind(search);
const indexCalls = [];
// search.indexEntities = async (...args) => {
//   if (appContext.get('mongoSession')) {
//     indexCalls.push(args);
//     return;
//   }
//   await indexEntities(...args);
// };

const withTransaction = async <T>(operation: () => Promise<T>): Promise<T> => {
  const session = await dbSessionContext.startSession();
  session.startTransaction();

  try {
    const result = await operation();

    await session.commitTransaction();
    // await Promise.all(indexCalls.map(indexArgs => indexEntities(...indexArgs)));
    return result;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    dbSessionContext.clearSession();
    await session.endSession();
  }
};

export { withTransaction };
