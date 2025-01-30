import { Db, ObjectId } from 'mongodb';
import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { MongoResultSet } from 'api/common.v2/database/MongoResultSet';
import { PXExtractorsDataSource } from '../domain/PXExtractorDataSource';
import { PXExtractor } from '../domain/PXExtractor';
import { MongoPXExtractorDBO } from './MongoPXExtractorDBO';

export const mongoExtractorsCollectionName = 'px_extractors';

export class MongoPXExtractorsDataSource
  extends MongoDataSource<MongoPXExtractorDBO>
  implements PXExtractorsDataSource
{
  private templatesDS: TemplatesDataSource;

  protected collectionName = mongoExtractorsCollectionName;

  constructor(
    db: Db,
    transactionManager: MongoTransactionManager,
    templatesDS: TemplatesDataSource
  ) {
    super(db, transactionManager);

    this.templatesDS = templatesDS;
  }

  getById(id: string): Promise<PXExtractor | undefined> {
    throw new Error('Method not implemented.');
  }

  async getAll() {
    const templates = await this.templatesDS.getAll().all();

    const extractors = new MongoResultSet(this.getCollection().find({}), dbo => {
      const sourceTemplate = templates.find(
        template => template.id === dbo.sourceTemplateId.toString()
      );

      const targetTemplate = templates.find(
        template => template.id === dbo.targetTemplateId.toString()
      );

      if (!sourceTemplate || !targetTemplate) {
        throw new Error('Template does not exist');
      }

      return new PXExtractor({
        id: dbo._id.toString(),
        sourceTemplate,
        targetTemplate,
      });
    });

    return extractors;
  }

  async create(extractor: PXExtractor): Promise<void> {
    const mongoExtractor: MongoPXExtractorDBO = {
      _id: new ObjectId(extractor.id),
      sourceTemplateId: new ObjectId(extractor.sourceTemplate.id),
      targetTemplateId: new ObjectId(extractor.targetTemplate.id),
    };

    await this.getCollection().insertOne(mongoExtractor);
  }

  nextId(): string {
    return new ObjectId().toString();
  }
}
