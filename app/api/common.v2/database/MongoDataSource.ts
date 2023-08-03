import { Collection, Db, Document } from 'mongodb';
import { BulkWriteStream } from './BulkWriteStream';
import { MongoTransactionManager } from './MongoTransactionManager';

/**
 * Map of collection members to position of its options argument.
 * Position is based on 1.
 */
type MethodsOptionsArgPosition = {
  [method in keyof Collection]: Collection[method] extends (...args: any) => any
    ? number | null
    : null;
};

export abstract class MongoDataSource<CollectionSchema extends Document = any> {
  protected db: Db;

  protected abstract collectionName: string;

  private transactionManager: MongoTransactionManager;

  private collectionProxy?: Collection<CollectionSchema>;

  constructor(db: Db, transactionManager: MongoTransactionManager) {
    this.db = db;
    this.transactionManager = transactionManager;
  }

  static scopedMethods: MethodsOptionsArgPosition = {
    insertOne: 2,
    insertMany: 2,
    bulkWrite: 2,
    updateOne: 3,
    replaceOne: 3,
    updateMany: 3,
    deleteOne: 2,
    deleteMany: 2,
    rename: 2,
    drop: 1,
    findOne: 2,
    find: 2,
    options: 1,
    isCapped: 1,
    createIndex: 2,
    createIndexes: 2,
    dropIndex: 2,
    dropIndexes: 1,
    listIndexes: 1,
    indexExists: 2,
    indexInformation: 1,
    estimatedDocumentCount: 1,
    countDocuments: 2,
    distinct: 3,
    indexes: 1,
    stats: 1,
    findOneAndDelete: 2,
    findOneAndReplace: 3,
    findOneAndUpdate: 3,
    aggregate: 2,
    watch: 2,
    initializeUnorderedBulkOp: 1,
    initializeOrderedBulkOp: 1,
    count: 2,
    listSearchIndexes: null,
    createSearchIndex: null,
    createSearchIndexes: null,
    dropSearchIndex: null,
    updateSearchIndex: null,
    dbName: null,
    collectionName: null,
    namespace: null,
    readConcern: null,
    readPreference: null,
    bsonOptions: null,
    writeConcern: null,
    hint: null,
  } as const;

  private appendSessionToOptions(args: any[], method: keyof MethodsOptionsArgPosition) {
    const optionsPosition = MongoDataSource.scopedMethods[method]! - 1;

    const minArgumentsLength = optionsPosition;
    const missingArgumentsLength = minArgumentsLength - args.length;

    const paddedArgs =
      missingArgumentsLength > 0
        ? args.concat(Array(missingArgumentsLength).fill(undefined))
        : args;

    paddedArgs[optionsPosition] = {
      ...paddedArgs[optionsPosition],
      session: this.transactionManager.getSession(),
    };

    return paddedArgs;
  }

  private scopeCollectionToSession(collection: Collection<CollectionSchema>) {
    if (this.collectionProxy) {
      return this.collectionProxy;
    }

    const self = this;

    this.collectionProxy = new Proxy<Collection<CollectionSchema>>(collection, {
      get(target, property, receiver) {
        const propertyName = <keyof Collection<CollectionSchema>>property;
        if (
          typeof property === 'string' &&
          Object.keys(MongoDataSource.scopedMethods).includes(property as keyof Collection) &&
          MongoDataSource.scopedMethods[property as keyof Collection] !== null
        ) {
          const original = Reflect.get(target, property, receiver);

          return function proxiedFunction(...args: any[]) {
            return original.apply(receiver, self.appendSessionToOptions(args, propertyName));
          };
        }

        return Reflect.get(target, property, receiver);
      },
    });

    return this.collectionProxy;
  }

  protected getCollection() {
    return this.scopeCollectionToSession(this.db.collection(this.collectionName));
  }

  protected getSession() {
    return this.transactionManager.getSession();
  }

  protected createBulkStream() {
    return new BulkWriteStream(this.getCollection());
  }
}
