import { ResultSet } from 'api/common.v2/contracts/ResultSet';
import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { MongoResultSet } from 'api/common.v2/database/MongoResultSet';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { MongoIdHandler } from 'api/common.v2/database/MongoIdGenerator';
import { MongoRelationshipsDataSource } from 'api/relationships.v2/database/MongoRelationshipsDataSource';
import { MongoSettingsDataSource } from 'api/settings.v2/database/MongoSettingsDataSource';
import { MongoTemplatesDataSource } from 'api/templates.v2/database/MongoTemplatesDataSource';
import { Db } from 'mongodb';
import { EntitiesDataSource } from '../contracts/EntitiesDataSource';
import { EntityMappers } from './EntityMapper';
import { EntityDBO, EntityJoinTemplate } from './schemas/EntityTypes';
import { Denormalizer } from './Denormalizer';

export class MongoEntitiesDataSource
  extends MongoDataSource<EntityDBO>
  // eslint-disable-next-line prettier/prettier
  implements EntitiesDataSource {
  protected collectionName = 'entities';

  private settingsDS: MongoSettingsDataSource;

  protected relationshipsDS: MongoRelationshipsDataSource;

  protected templatesDS: MongoTemplatesDataSource;

  constructor(
    db: Db,
    templatesDS: MongoTemplatesDataSource,
    relationshipsDS: MongoRelationshipsDataSource,
    settingsDS: MongoSettingsDataSource,
    transactionManager: MongoTransactionManager
  ) {
    super(db, transactionManager);
    this.templatesDS = templatesDS;
    this.settingsDS = settingsDS;
    this.relationshipsDS = relationshipsDS;
  }

  async entitiesExist(sharedIds: string[]) {
    const languages = await this.settingsDS.getLanguageKeys();
    const countInExistence = await this.getCollection().countDocuments(
      { sharedId: { $in: sharedIds } },
      { session: this.getSession() }
    );
    return countInExistence === sharedIds.length * languages.length;
  }

  async markMetadataAsChanged(
    propData: Parameters<EntitiesDataSource['markMetadataAsChanged']>[0]
  ) {
    const stream = this.createBulkStream();
    for (let i = 0; i < propData.length; i += 1) {
      const data = propData[i];

      const filter =
        'template' in data
          ? { template: MongoIdHandler.mapToDb(data.template) }
          : { sharedId: data.sharedId };
      const update = 'properties' in data ? { $each: data.properties } : data.property;

      // eslint-disable-next-line no-await-in-loop
      await stream.updateMany(filter, { $addToSet: { obsoleteMetadata: update } });
    }
    await stream.flush();
  }

  getByIds(sharedIds: string[], language?: string) {
    const match: { sharedId: { $in: string[] }; language?: string } = {
      sharedId: { $in: sharedIds },
    };
    if (language) match.language = language;
    const cursor = this.getCollection().aggregate<EntityJoinTemplate>(
      [
        { $match: match },
        {
          $lookup: {
            from: 'templates',
            localField: 'template',
            foreignField: '_id',
            as: 'joinedTemplate',
          },
        },
      ],
      { session: this.getSession() }
    );

    const denormalizer = new Denormalizer(this, this.templatesDS, this.relationshipsDS);

    return new MongoResultSet(cursor, async entity => {
      const mappedMetadata = await denormalizer.execute(entity);
      return EntityMappers.toModel({ ...entity, metadata: mappedMetadata });
    });
  }

  async updateDenormalizedMetadataValues(
    sharedId: string,
    language: string,
    title: string,
    propertiesToNewValues: { propertyName: string; value?: any }[]
  ) {
    const stream = this.createBulkStream();

    await Promise.all(
      propertiesToNewValues.map(async ({ propertyName, value }) => {
        await stream.updateMany(
          { [`metadata.${propertyName}.value`]: sharedId, language },
          // @ts-ignore
          {
            $set: {
              [`metadata.${propertyName}.$[valueIndex].label`]: title,
              ...(value
                ? { [`metadata.${propertyName}.$[valueIndex].inheritedValue`]: value }
                : {}),
            },
          },
          {
            arrayFilters: [{ 'valueIndex.value': sharedId }],
          }
        );
      })
    );

    return stream.flush();
  }

  getByDenormalizedId(properties: string[], sharedIds: string[]): ResultSet<string> {
    const result = this.getCollection().find({
      $or: properties.map(property => ({ [`metadata.${property}.value`]: { $in: sharedIds } })),
    });

    return new MongoResultSet(result, entity => entity.sharedId);
  }
}
