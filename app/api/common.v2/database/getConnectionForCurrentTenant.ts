import { Db, MongoClient } from 'mongodb';
import { DB } from 'api/odm';
import { tenants } from 'api/tenants';
import { Tenant } from 'api/tenants/tenantContext';
import { config } from 'api/config';

function getTenant(): Tenant {
  return tenants.current();
}

function getConnection(): Db {
  if (config.env_feature_flags.use_mongodb_instead_of_mongoose) {
    return DB.mongodb_Db(getTenant().dbName);
  }
  const { db } = DB.connectionForDB(getTenant().dbName);
  if (!db) {
    throw new Error('DB object is undefined');
  }
  return db;
}

function getSharedConnection(): Db {
  if (config.env_feature_flags.use_mongodb_instead_of_mongoose) {
    return DB.mongodb_Db(getTenant().dbName);
  }
  const { db } = DB.connectionForDB(config.SHARED_DB);
  if (!db) {
    throw new Error('DB object is undefined');
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
