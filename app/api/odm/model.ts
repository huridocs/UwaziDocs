import { SyncDBDataSource } from 'api/common.v2/database/SyncDBDataSource';
import { legacyLogger } from 'api/log';
import { ObjectId, UpdateOptions } from 'mongodb';
import mongoose, {
  FilterQuery,
  MongooseQueryOptions,
  QueryOptions,
  Schema,
  UpdateQuery,
} from 'mongoose';
import { ObjectIdSchema } from 'shared/types/commonTypes';
import { inspect } from 'util';
import { MultiTenantMongooseModel } from './MultiTenantMongooseModel';
import { UpdateLogger, createUpdateLogHelper } from './logHelper';
import { ModelBulkWriteStream } from './modelBulkWriteStream';
import { ClientSession } from 'mongodb';
import { appContext } from 'api/utils/AppContext';

/** Ideas!
 *  T is the actual model-specific document Schema!
 *  DataType should be the specific Schema with Document, in order to have _id and other Document specific characteristcs
 *  WithId should be returned by get model?
 *  Do we need to type Uwazi specific Filter, Update and Query?
 */

export type DataType<T> = T & { _id?: ObjectIdSchema };

export type WithId<T> = T & { _id: ObjectId };

export type EnforcedWithId<T> = T & { _id: ObjectId };

export type UwaziFilterQuery<T> = FilterQuery<T>;
export type UwaziUpdateQuery<T> = UpdateQuery<DataType<T>>;
export type UwaziQueryOptions = QueryOptions;
export type UwaziUpdateOptions<T> = (UpdateOptions & Omit<MongooseQueryOptions<T>, 'lean'>) | null;

export class OdmModel<T> implements SyncDBDataSource<T, T> {
  private collectionName: string;

  db: MultiTenantMongooseModel<T>;

  logHelper: UpdateLogger<T>;

  options: { optimisticLock: boolean };

  constructor(
    logHelper: UpdateLogger<T>,
    collectionName: string,
    schema: Schema,
    options: { optimisticLock: boolean } = { optimisticLock: false }
  ) {
    this.collectionName = collectionName;
    this.db = new MultiTenantMongooseModel<T>(collectionName, schema);
    this.logHelper = logHelper;
    this.options = options;
  }

  private documentExists(data: Partial<DataType<T>>) {
    return this.db.findById(data._id, '_id');
  }

  private async documentExistsByQuery(query: any = undefined) {
    const existsByQuery = await this.db.findOne(query, '_id');
    if (query && !existsByQuery) {
      throw Error('The document was not updated!');
    }
    return true;
  }

  private async checkVersion(query: any, version: number, data: Partial<DataType<T>>) {
    if (!this.options.optimisticLock) {
      return;
    }
    if (version === undefined) {
      return;
    }
    const docMatches = await this.db.findOne({ ...query, __v: version }, '_id');
    if (!docMatches) {
      legacyLogger.debug(
        inspect(
          new Error(
            `[Optimistic lock] version conflict '${version}' for ${this.collectionName} collection with _id ${data._id}`
          )
        )
      );
    }
  }

  private getSession(): ClientSession | undefined {
    return appContext.get('mongoSession') as ClientSession | undefined;
  }

  async startSession(): Promise<ClientSession> {
    return this.db.startSession();
  }

  async save(data: Partial<DataType<T>>, _query?: any) {
    const session = this.getSession();
    if (await this.documentExists(data)) {
      const { __v: version, ...toSaveData } = data;
      const query =
        _query && (await this.documentExistsByQuery(_query)) ? _query : { _id: data._id };

      await this.checkVersion(query, version, data);
      const saved = await this.db.findOneAndUpdate(
        query,
        { $set: toSaveData as UwaziUpdateQuery<DataType<T>>, $inc: { __v: 1 } },
        { new: true, ...(session && { session }) }
      );

      if (saved === null) {
        throw Error('The document was not updated!');
      }

      await this.logHelper.upsertLogOne(saved);
      return saved.toObject<WithId<T>>();
    }
    return this.create(data);
  }

  async create(data: Partial<DataType<T>>) {
    const session = this.getSession();
    const saved = await this.db.create([data], session && { session });
    await this.logHelper.upsertLogOne(saved[0]);
    return saved[0].toObject<WithId<T>>();
  }

  async saveMultiple(
    dataArray: Partial<DataType<T>>[],
    query?: any,
    updateExisting: boolean = true
  ) {
    const { existingIds, existingData, updated } = await this.saveExisting(
      dataArray,
      query,
      updateExisting
    );
    const created = await this.saveNew(existingIds, dataArray);

    if (updated.length !== existingData.length) {
      throw Error('A document was not updated!');
    }

    const saved = updated.concat(created);
    await Promise.all(saved.map(async s => this.logHelper.upsertLogOne(s)));
    return saved.map(s => s.toObject<WithId<T>>());
  }

  private async saveNew(existingIds: Set<string>, dataArray: Partial<DataType<T>>[]) {
    const session = this.getSession();
    const newData = dataArray.filter(d => !d._id || !existingIds.has(d._id.toString()));
    return (await this.db.createMany(newData, session && { session })) || [];
  }

  private async saveExisting(
    dataArray: Partial<DataType<T>>[],
    query?: any,
    updateExisting: boolean = true
  ) {
    const session = this.getSession();
    const ids: DataType<T>['_id'][] = [];
    dataArray.forEach(d => {
      if (d._id) {
        ids.push(d._id);
      }
    });
    const existingIds = new Set<string>(
      (
        await this.db.find({ _id: { $in: ids } } as UwaziFilterQuery<DataType<T>>, '_id', {
          lean: true,
          ...(session && { session }),
        })
      ).map(d => d._id.toString())
    );

    const existingData = dataArray.filter(d => d._id && existingIds.has(d._id.toString()));
    if (updateExisting) {
      await this.db.bulkWrite(
        existingData.map(data => ({
          updateOne: {
            filter: { ...query, _id: data._id },
            update: data,
          },
        })),
        session && { session }
      );

      const updated = await this.db.find(
        {
          ...query,
          _id: { $in: Array.from(existingIds) },
        } as UwaziFilterQuery<DataType<T>>,
        undefined,
        session && { session }
      );

      return { existingIds, existingData, updated };
    }

    return { existingIds, existingData, updated: [] };
  }

  async updateMany(
    conditions: UwaziFilterQuery<DataType<T>>,
    doc: UwaziUpdateQuery<T>,
    options: UwaziUpdateOptions<DataType<T>> = {}
  ) {
    const session = this.getSession();
    await this.logHelper.upsertLogMany(conditions);
    return this.db._updateMany(conditions, doc, { ...options, ...(session && { session }) });
  }

  async count(query: UwaziFilterQuery<DataType<T>> = {}) {
    const session = this.getSession();
    return this.db.countDocuments(query, session && { session });
  }

  async get(
    query: UwaziFilterQuery<DataType<T>> = {},
    select: any = '',
    options: UwaziQueryOptions = {}
  ) {
    const session = this.getSession();
    const results = await this.db.find(query, select, {
      ...options,
      ...(session && { session }),
      lean: true,
    });
    return results as EnforcedWithId<T>[];
  }

  async getById(id: any, select?: any) {
    const session = this.getSession();
    const results = await this.db.findById(id, select, { lean: true, ...(session && { session }) });
    return results as EnforcedWithId<T> | null;
  }

  async delete(condition: any) {
    const session = this.getSession();
    let cond = condition;
    if (mongoose.Types.ObjectId.isValid(condition)) {
      cond = { _id: condition };
    }
    await this.logHelper.upsertLogMany(cond, true);
    return this.db.deleteMany(cond, session && { session });
  }

  async facet(aggregations: any[], pipelines: any, project: any) {
    return this.db.facet(aggregations, pipelines, project);
  }

  openBulkWriteStream(stackLimit?: number, ordered?: boolean) {
    return new ModelBulkWriteStream(this, stackLimit, ordered);
  }
}

// models are accessed in api/sync, which cannot be type-safe since the document
// type is a request parameter. Thus, we store all OdmModels as type Document.
// export const models: { [index: string]: OdmModel<any> } = {};
export const models: { [index: string]: () => SyncDBDataSource<any, any> } = {};

export function instanceModel<T = any>(
  collectionName: string,
  schema: Schema,
  options: { optimisticLock: boolean } = { optimisticLock: false }
) {
  const logHelper = createUpdateLogHelper<T>(collectionName);
  const model = new OdmModel<T>(logHelper, collectionName, schema, options);
  models[collectionName] = () => model;
  return model;
}
