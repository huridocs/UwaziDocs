import { ObjectId } from 'mongodb';
import db from 'api/utils/testing_db';
import { DefaultTemplatesDataSource } from 'api/templates.v2/database/data_source_defaults';
import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { MongoExtractorsDataSource } from 'api/paragraphExtraction/infrastructure/MongoExtractorsDataSource.ts';
import { getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { SourceTemplateNotFoundError } from 'api/paragraphExtraction/domain/SourceTemplateNotFoundError copy';
import { TargetTemplateNotFoundError } from 'api/paragraphExtraction/domain/TargetTemplateNotFoundError';
import { TargetTemplateInvalidError } from 'api/paragraphExtraction/domain/TargetTemplateInvalidError';
import { TargetSourceTemplateEqualError } from 'api/paragraphExtraction/domain/TargetSourceTemplateEqualError';
import { CreateExtractorUseCase } from '../CreateExtractorUseCase';
import { fixtures, sourceTemplate, targetTemplate } from './fixtures';

const createSut = () => {
  const transaction = DefaultTransactionManager();
  const templatesDS = DefaultTemplatesDataSource(transaction);

  const extractorDS = new MongoExtractorsDataSource(getConnection(), transaction, templatesDS);

  return {
    templatesDS,
    extractorDS,
    sut: new CreateExtractorUseCase({
      extractorDS,
      templatesDS,
    }),
  };
};

describe('CreateExtractorUseCase', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext(fixtures);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should create an Extractor correctly', async () => {
    const { sut } = createSut();

    await sut.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId: targetTemplate._id.toString(),
    });

    const mongoExtractors = await db.paragraphExtractionExtractors()?.find().toArray();

    expect(mongoExtractors).toEqual([
      {
        _id: expect.any(ObjectId),
        sourceTemplateId: expect.any(ObjectId),
        targetTemplateId: expect.any(ObjectId),
      },
    ]);
  });

  it('should throw if target Template does not exist', async () => {
    const { sut } = createSut();

    const targetTemplateId = new ObjectId().toString();

    const promise = sut.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId,
    });

    await expect(promise).rejects.toEqual(new TargetTemplateNotFoundError(targetTemplateId));
  });

  it('should throw if source Template does not exist', async () => {
    const { sut } = createSut();

    const sourceTemplateId = new ObjectId().toString();

    const promise = sut.execute({
      targetTemplateId: sourceTemplate._id.toString(),
      sourceTemplateId,
    });

    await expect(promise).rejects.toEqual(new SourceTemplateNotFoundError(sourceTemplateId));
  });

  it('should throw if target template is not valid for create an Extractor', async () => {
    await db.setupFixturesAndContext({
      ...fixtures,
      templates: [{ ...targetTemplate, properties: [] }, sourceTemplate],
    });

    const { sut } = createSut();

    const promise = sut.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId: targetTemplate._id.toString(),
    });

    await expect(promise).rejects.toEqual(
      new TargetTemplateInvalidError(targetTemplate._id.toString())
    );

    const mongoExtractors = await db.paragraphExtractionExtractors()?.find().toArray();

    expect(mongoExtractors).toEqual([]);
  });

  it('should throw if target and source template are the same', async () => {
    const { sut } = createSut();

    const promise = sut.execute({
      sourceTemplateId: targetTemplate._id.toString(),
      targetTemplateId: targetTemplate._id.toString(),
    });

    await expect(promise).rejects.toEqual(new TargetSourceTemplateEqualError());

    const mongoExtractors = await db.paragraphExtractionExtractors()?.find().toArray();

    expect(mongoExtractors).toEqual([]);
  });
});
