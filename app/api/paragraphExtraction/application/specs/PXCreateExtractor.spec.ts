import { ObjectId } from 'mongodb';

import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoIdHandler } from 'api/common.v2/database/MongoIdGenerator';
import { DefaultTemplatesDataSource } from 'api/templates.v2/database/data_source_defaults';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';

import { PXErrorCode } from 'api/paragraphExtraction/domain/PXValidationError';
import {
  mongoPXExtractorsCollection,
  MongoPXExtractorsDataSource,
} from '../../infrastructure/MongoPXExtractorsDataSource';
import { PXCreateExtractor } from '../PXCreateExtractor';

const factory = getFixturesFactory();

const setUpUseCase = () => {
  const transaction = DefaultTransactionManager();
  const templatesDS = DefaultTemplatesDataSource(transaction);

  const extractorDS = new MongoPXExtractorsDataSource(getConnection(), transaction);

  return {
    createExtractor: new PXCreateExtractor({
      extractorDS,
      templatesDS,
      idGenerator: MongoIdHandler,
    }),
  };
};

const sourceTemplate = factory.template('Source Template', [factory.property('text', 'text')]);
const targetTemplate = factory.template('Target Template', [
  factory.property('rich_text', 'markdown'),
]);
const invalidTargetTemplate = factory.template('Invalid Target');

describe('PXCreateExtractor', () => {
  beforeEach(async () => {
    await testingEnvironment.setUp({
      templates: [sourceTemplate, targetTemplate, invalidTargetTemplate],
    });
  });

  afterAll(async () => {
    await testingEnvironment.tearDown();
  });

  it('should create an Extractor correctly', async () => {
    const { createExtractor } = setUpUseCase();

    await createExtractor.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId: targetTemplate._id.toString(),
    });

    const dbPXExtractors = await testingEnvironment.db.getAllFrom(mongoPXExtractorsCollection);

    expect(dbPXExtractors).toEqual([
      {
        _id: expect.any(ObjectId),
        sourceTemplateId: expect.any(ObjectId),
        targetTemplateId: expect.any(ObjectId),
      },
    ]);
  });

  it('should throw if target Template does not exist', async () => {
    const { createExtractor } = setUpUseCase();
    const targetTemplateId = new ObjectId().toString();

    const promise = createExtractor.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId,
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.TARGET_TEMPLATE_NOT_FOUND,
    });
  });

  it('should throw if source Template does not exist', async () => {
    const { createExtractor } = setUpUseCase();
    const sourceTemplateId = new ObjectId().toString();

    const promise = createExtractor.execute({
      targetTemplateId: sourceTemplate._id.toString(),
      sourceTemplateId,
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.SOURCE_TEMPLATE_NOT_FOUND,
    });
  });

  it('should throw if target template is not valid for create an Extractor', async () => {
    const { createExtractor } = setUpUseCase();

    const promise = createExtractor.execute({
      sourceTemplateId: sourceTemplate._id.toString(),
      targetTemplateId: invalidTargetTemplate._id.toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.TARGET_TEMPLATE_INVALID,
    });

    const dbPXExtractors = await testingEnvironment.db.getAllFrom(mongoPXExtractorsCollection);
    expect(dbPXExtractors).toEqual([]);
  });

  it('should throw if target and source template are the same', async () => {
    const { createExtractor } = setUpUseCase();

    const promise = createExtractor.execute({
      sourceTemplateId: targetTemplate._id.toString(),
      targetTemplateId: targetTemplate._id.toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.TARGET_SOURCE_TEMPLATE_EQUAL,
    });

    const dbPXExtractors = await testingEnvironment.db.getAllFrom(mongoPXExtractorsCollection);
    expect(dbPXExtractors).toEqual([]);
  });
});
