import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { config } from 'api/config';
import { DbOptions } from 'mongodb';

let connection: Connection;

mongoose.set('strictQuery', false);

const DB = {
  async connect(uri: string = config.DBHOST, auth: ConnectOptions = {}) {
    connection = await mongoose
      .createConnection(uri, {
        ...auth,
        maxPoolSize: config.mongo_connection_pool_size,
      })
      .asPromise();

    return this.getConnection();
  },

  async disconnect() {
    return mongoose.disconnect();
  },

  connectionForDB(dbName: string, options = { useCache: true, noListener: true }) {
    return this.getConnection().useDb(dbName, options);
  },

  mongodb_Db(dbName: string, options?: DbOptions) {
    return this.getConnection().getClient().db(dbName, options);
  },

  getConnection() {
    return connection;
  },
};

export { DB };
