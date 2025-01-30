import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { ObjectId } from 'mongodb';
import { PXExtractor } from '../domain/PXExtractor';
import { PXExtractorsDataSource } from '../domain/PXExtractorDataSource';
import { MongoPXExtractorDBO } from './MongoPXExtractorDBO';

export const mongoExtractorsCollectionName = 'px_extractors';

export class MongoPXExtractorsDataSource
  extends MongoDataSource<MongoPXExtractorDBO>
  implements PXExtractorsDataSource
{
  protected collectionName = mongoExtractorsCollectionName;

  async create(extractor: PXExtractor): Promise<void> {
    const mongoExtractor: MongoPXExtractorDBO = {
      _id: new ObjectId(extractor.id),
      sourceTemplateId: new ObjectId(extractor.sourceTemplate.id),
      targetTemplateId: new ObjectId(extractor.targetTemplate.id),
    };

    await this.getCollection().insertOne(mongoExtractor);
  }
}
