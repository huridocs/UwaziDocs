import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { CountDocument, MongoResultSet } from 'api/common.v2/database/MongoResultSet';
import { MongoIdGenerator } from 'api/common.v2/database/MongoIdGenerator';
import { Relationship } from '../model/Relationship';
import { RelationshipMappers } from './RelationshipMappers';
import { MongoGraphQueryParser } from './MongoGraphQueryParser';
import { RelationshipsQuery } from '../contracts/RelationshipsQuery';
import {
  RelationshipDBOType,
  EntityInfoType,
  JoinedRelationshipDBOType,
} from './schemas/relationshipTypes';
import { RelationshipsDataSource } from '../contracts/RelationshipsDataSource';
import { compileQuery } from './MongoGraphQueryCompiler';
import { MatchQueryNode } from './graphs/MatchQueryNode';

function unrollTraversal({ traversal, ...rest }: any): any {
  return [{ ...rest }].concat(traversal ? unrollTraversal(traversal) : []);
}

const idsToDb = (ids: string[]) => ids.map(id => MongoIdGenerator.mapToDb(id));

type RelationshipAggregatedResultType = Omit<
  RelationshipDBOType,
  '_id' | 'type' | 'from' | 'to'
> & {
  _id: string;
  type: string;
  from: EntityInfoType;
  to: EntityInfoType;
};

export class MongoRelationshipsDataSource
  extends MongoDataSource<RelationshipDBOType>
  implements RelationshipsDataSource
{ // eslint-disable-line
  protected collectionName = 'relationships';

  async insert(relationships: Relationship[]): Promise<Relationship[]> {
    const items = relationships.map(r => RelationshipMappers.toDBO(r));
    const { ops: created } = (await this.getCollection().insertMany(items, {
      session: this.session,
    })) as { ops: RelationshipDBOType[] };

    return created.map(item => RelationshipMappers.toModel(item));
  }

  private async count(ids: string[]) {
    return this.getCollection().countDocuments(
      { _id: { $in: idsToDb(ids) } },
      { session: this.session }
    );
  }

  async exists(ids: string[]) {
    const existingCount = await this.count(ids);
    return existingCount === ids.length;
  }

  getById(_ids: string[]) {
    const ids = idsToDb(_ids);
    const cursor = this.getCollection().find({ _id: { $in: ids } }, { session: this.session });
    return new MongoResultSet<RelationshipDBOType, Relationship>(
      cursor,
      RelationshipMappers.toModel
    );
  }

  async delete(_ids: string[]) {
    const ids = idsToDb(_ids);
    const deleted = await this.getById(_ids).all();
    await this.getCollection().deleteMany({ _id: { $in: ids } }, { session: this.session });
    return deleted;
  }

  getByEntity(sharedId: string) {
    const matchStage = {
      $match: {
        $or: [{ from: sharedId }, { to: sharedId }],
      },
    };
    const totalCursor = this.getCollection().aggregate<CountDocument>([
      matchStage,
      {
        $count: 'total',
      },
    ]);

    const dataCursor = this.getCollection().aggregate<JoinedRelationshipDBOType>([
      matchStage,
      {
        $lookup: {
          from: 'entities',
          localField: 'from',
          foreignField: 'sharedId',
          as: 'from',
        },
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'to',
          foreignField: 'sharedId',
          as: 'to',
        },
      },
    ]);

    return new MongoResultSet<JoinedRelationshipDBOType, RelationshipAggregatedResultType>(
      dataCursor,
      totalCursor,
      RelationshipMappers.toAggregatedResult
    );
  }

  getByQuery(query: RelationshipsQuery) {
    const parser = new MongoGraphQueryParser();
    const parsed = parser.parse(query);
    const pipeline = compileQuery(parsed);
    const cursor = this.db.collection('entities').aggregate(pipeline, { session: this.session });
    const count = this.db.collection('entities').aggregate(
      [
        ...pipeline,
        {
          $count: 'total',
        },
      ],
      { session: this.session }
    );
    return new MongoResultSet(cursor, count, elem => unrollTraversal(elem));
  }

  getByModelQuery(query: MatchQueryNode) {
    const pipeline = compileQuery(query);
    const cursor = this.db.collection('entities').aggregate(pipeline, { session: this.session });
    const count = this.db.collection('entities').aggregate(
      [
        ...pipeline,
        {
          $count: 'total',
        },
      ],
      { session: this.session }
    );
    return new MongoResultSet(cursor, count, elem => unrollTraversal(elem));
  }
}
