import { Db, MongoClient } from 'mongodb';
import { DB } from 'api/odm';
import { tenants } from 'api/tenants';
import { Tenant } from 'api/tenants/tenantContext';
import { config } from 'api/config';

function getTenant(): Tenant {
  return tenants.current();
}

function getConnection(): Db {
  return DB.mongodb_Db(getTenant().dbName);
}

function getSharedConnection(): Db {
  return DB.mongodb_Db(getTenant().dbName);
}

function getClient(): MongoClient {
  return DB.connectionForDB(getTenant().dbName).getClient();
}

function getSharedClient(): MongoClient {
  return DB.connectionForDB(config.SHARED_DB).getClient();
}

export { getTenant, getConnection, getSharedConnection, getSharedClient, getClient };
