import { tenants } from 'api/tenants';
import { appContext } from 'api/utils/AppContext';
import { ClientSession } from 'mongoose';
import { DB } from './DB';

export const dbSessionContext = {
  getSession() {
    return appContext.get('mongoSession') as ClientSession | undefined;
  },

  getReindexOperations() {
    return (
      (appContext.get('reindexOperations') as [query?: any, select?: string, limit?: number][]) ||
      []
    );
  },

  clearSession() {
    appContext.set('mongoSession', undefined);
  },

  clearContext() {
    appContext.set('mongoSession', undefined);
    appContext.set('reindexOperations', undefined);
  },

  async startSession() {
    const currentTenant = tenants.current();
    const connection = DB.connectionForDB(currentTenant.dbName);
    const session = await connection.startSession();
    appContext.set('mongoSession', session);
    return session;
  },

  registerESIndexOperation(args: [query?: any, select?: string, limit?: number]) {
    const reindexOperations = dbSessionContext.getReindexOperations();
    reindexOperations.push(args);
    appContext.set('reindexOperations', reindexOperations);
  },
};
