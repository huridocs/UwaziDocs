import { ObjectId } from 'mongodb';
import { DefaultEntitiesDataSource } from 'api/entities.v2/database/data_source_defaults';
import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { DefaultFilesDataSource } from 'api/files.v2/database/data_source_defaults';
import {
  mongoPXExtractorsCollection,
  MongoPXExtractorsDataSource,
} from 'api/paragraphExtraction/infrastructure/MongoPXExtractorsDataSource';
import { MongoPXExtractorDBO } from 'api/paragraphExtraction/infrastructure/MongoPXExtractorDBO';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import { PXErrorCode } from 'api/paragraphExtraction/domain/PXValidationError';
import { MongoSegmentationBuilder } from 'api/files.v2/database/specs/MongoSegmentationBuilder';
import { DBFixture } from 'api/utils/testing_db';

import { PXExtractionService } from 'api/paragraphExtraction/domain/PXExtractionService';
import { PXExtractParagraphsFromEntity } from '../PXExtractParagraphFromEntity';

const factory = getFixturesFactory();

const defaultTemplate = factory.template('Default Template');
const sourceTemplate = factory.template('Source Template', [factory.property('text', 'text')]);
const targetTemplate = factory.template('Target Template', [
  factory.property('rich_text', 'markdown'),
]);

const invalidEntity = factory.entity('invalidEntity', defaultTemplate.name);

const entity = factory.entity('entity', sourceTemplate.name);

const extractor: MongoPXExtractorDBO = {
  _id: factory.id('extractor'),
  sourceTemplateId: sourceTemplate._id,
  targetTemplateId: targetTemplate._id,
};

const file = factory.document('file', { language: 'eng', entity: entity.sharedId });
const file2 = factory.document('file2', { language: 'spa', entity: entity.sharedId });
const fileWithLanguageNotConfigured = factory.document('fileWithLanguageNotConfigured', {
  language: 'por',
  entity: entity.sharedId,
});

const segmentation = MongoSegmentationBuilder.create().withFileId(file._id).build();

const segmentation2 = MongoSegmentationBuilder.create().withFileId(file2._id).build();

const fileWithLanguageNotConfiguredSegmentation = MongoSegmentationBuilder.create()
  .withFileId(fileWithLanguageNotConfigured._id)
  .build();

const createFixtures = (): DBFixture => ({
  [mongoPXExtractorsCollection]: [extractor],
  templates: [sourceTemplate, targetTemplate, defaultTemplate],
  entities: [entity, invalidEntity],
  settings: [
    {
      languages: [
        { label: 'English', key: 'en' },
        { label: 'Spanish', key: 'es' },
      ],
    },
  ],
  files: [file, file2, fileWithLanguageNotConfigured],
  segmentations: [segmentation, segmentation2, fileWithLanguageNotConfiguredSegmentation],
});

const setUpUseCase = () => {
  const extractionService: PXExtractionService = {
    extractParagraph: jest.fn(),
  };

  const db = getConnection();
  const transaction = DefaultTransactionManager();
  const entityDS = DefaultEntitiesDataSource(transaction);
  const settingsDS = DefaultSettingsDataSource(transaction);
  const filesDS = DefaultFilesDataSource(transaction);
  const extractorsDS = new MongoPXExtractorsDataSource(db, transaction);

  return {
    extractionService,
    extractParagraphs: new PXExtractParagraphsFromEntity({
      entityDS,
      extractorsDS,
      filesDS,
      settingsDS,
      extractionService,
    }),
  };
};

describe('PXExtractParagraphsFromEntity', () => {
  beforeEach(async () => {
    await testingEnvironment.setUp(createFixtures());
  });

  afterAll(async () => {
    await testingEnvironment.tearDown();
  });

  it('should throw if Extractor does not exist', async () => {
    const { extractParagraphs } = setUpUseCase();

    const promise = extractParagraphs.execute({
      entitySharedId: entity.sharedId!,
      extractorId: new ObjectId().toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.EXTRACTOR_NOT_FOUND,
    });
  });

  it('should throw if Entity does not exist', async () => {
    const { extractParagraphs } = setUpUseCase();

    const promise = extractParagraphs.execute({
      entitySharedId: new ObjectId().toString(),
      extractorId: extractor._id.toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.ENTITY_NOT_FOUND,
    });
  });

  it('should throw if Entity is not valid for the Extractor', async () => {
    const { extractParagraphs } = setUpUseCase();

    const promise = extractParagraphs.execute({
      entitySharedId: invalidEntity.sharedId!.toString()!,
      extractorId: extractor._id.toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.ENTITY_INVALID,
    });
  });

  it('should call extract paragraph service with correct params', async () => {
    const { extractParagraphs, extractionService } = setUpUseCase();

    await extractParagraphs.execute({
      entitySharedId: entity.sharedId!.toString()!,
      extractorId: extractor._id.toString(),
    });

    expect(extractionService.extractParagraph).toHaveBeenCalledWith([
      {
        id: segmentation._id?.toString(),
        fileId: segmentation.fileID?.toString(),
      },
      {
        id: segmentation2._id?.toString(),
        fileId: segmentation2.fileID?.toString(),
      },
    ]);
  });

  it('should throw if any of the Documents do not have Segmentations', async () => {
    const fixtures = createFixtures();
    fixtures.segmentations = [segmentation];

    await testingEnvironment.setFixtures(fixtures);

    const { extractParagraphs, extractionService } = setUpUseCase();

    const promise = extractParagraphs.execute({
      entitySharedId: entity.sharedId!.toString()!,
      extractorId: extractor._id.toString(),
    });

    await expect(promise).rejects.toMatchObject({
      code: PXErrorCode.SEGMENTATIONS_UNAVAILABLE,
    });

    expect(extractionService.extractParagraph).not.toHaveBeenCalled();
  });
});
