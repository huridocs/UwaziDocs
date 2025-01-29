import { tenants } from 'api/tenants';
import { appContext } from 'api/utils/AppContext';
import { ClientSession } from 'mongoose';
import { DB } from './DB';

export const dbSessionContext = {
  getSession() {
    return appContext.get('mongoSession') as ClientSession | undefined;
  },

  clearSession() {
    appContext.set('mongoSession', undefined);
  },

  async startSession() {
    const currentTenant = tenants.current();
    const connection = DB.connectionForDB(currentTenant.dbName);
    const session = await connection.startSession();
    appContext.set('mongoSession', session);
    return session;
  },
};
