import { FileBuilder } from 'api/files.v2/model/specs/utils/FileBuilder';
import { MongoPXExtractorDBO } from 'api/paragraphExtraction/infrastructure/MongoPXExtractorDBO';
import { getFixturesFactory } from 'api/utils/fixturesFactory';

const factory = getFixturesFactory();

export const defaultTemplate = factory.template('Default Template');
export const sourceTemplate = factory.template('Source Template', [
  factory.property('text', 'text'),
]);
export const targetTemplate = factory.template('Target Template', [
  factory.property('rich_text', 'markdown'),
]);

export const invalidEntity = factory.entity('invalidEntity', defaultTemplate.name);

export const entity = factory.entity('entity', sourceTemplate.name);

export const extractor: MongoPXExtractorDBO = {
  _id: factory.id('extractor'),
  sourceTemplateId: sourceTemplate._id,
  targetTemplateId: targetTemplate._id,
};

export const file = factory.document('file', { language: 'eng', entity: entity.sharedId });
export const file2 = factory.document('file2', { language: 'spa', entity: entity.sharedId });
export const fileWithLanguageNotConfigured = factory.document('fileWithLanguageNotConfigured', {
  language: 'por',
  entity: entity.sharedId,
});

export const segmentation = factory.MongoSegmentationBuilder.create().withFileId(file._id).build();

export const segmentation2 = factory.MongoSegmentationBuilder.create()
  .withFileId(file2._id)
  .build();

export const fileWithLanguageNotConfiguredSegmentation = factory.MongoSegmentationBuilder.create()
  .withFileId(fileWithLanguageNotConfigured._id)
  .build();

export const failedSegmentation = factory.MongoSegmentationBuilder.create()
  .withFileId(file._id)
  .withStatus('failed')
  .build();

export const processingSegmentation = factory.MongoSegmentationBuilder.create()
  .withFileId(file._id)
  .withStatus('processing')
  .build();

export const files = [
  FileBuilder.create().withFilename('file1.txt').build(),
  FileBuilder.create().withFilename('file2.txt').build(),
];
