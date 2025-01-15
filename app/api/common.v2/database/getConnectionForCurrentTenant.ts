import { Db, MongoClient } from 'mongodb';
import { DB } from 'api/odm';
import { tenants } from 'api/tenants';
import { Tenant } from 'api/tenants/tenantContext';
import { config } from 'api/config';

function getTenant(): Tenant {
  return tenants.current();
}

function getConnection(): Db {
  const { db } = DB.connectionForDB(getTenant().dbName);
  if (!db) {
    throw new Error();
  }
  return db;
}

function getSharedConnection(): Db {
  const { db } = DB.connectionForDB(config.SHARED_DB);
  if (!db) {
    throw new Error();
  }
  return db;
}

function getClient(): MongoClient {
  return DB.connectionForDB(getTenant().dbName).getClient();
}

function getSharedClient(): MongoClient {
  return DB.connectionForDB(config.SHARED_DB).getClient();
}

export { getTenant, getConnection, getSharedConnection, getSharedClient, getClient };
