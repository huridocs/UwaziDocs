import { z } from 'zod';
import { UseCase } from 'api/common.v2/contracts/UseCase';
import { EntitiesDataSource } from 'api/entities.v2/contracts/EntitiesDataSource';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { FilesDataSource } from 'api/files.v2/contracts/FilesDataSource';
import { Entity } from 'api/entities.v2/model/Entity';
import { Document } from 'api/files.v2/model/Document';
import { LanguagesListSchema } from 'shared/types/commonTypes';

import { PXExtractorsDataSource } from '../domain/PXExtractorDataSource';
import { PXErrorCode, PXValidationError } from '../domain/PXValidationError';
import { PXExtractionId, PXExtractionService } from '../domain/PXExtractionService';

type Input = z.infer<typeof Schema>;

type Output = any;

type Dependencies = {
  extractorsDS: PXExtractorsDataSource;
  entityDS: EntitiesDataSource;
  filesDS: FilesDataSource;
  settingsDS: SettingsDataSource;
  extractionService: PXExtractionService;
};

const Schema = z.object({
  extractorId: z.string({ message: 'You should provide an Extractor' }),
  entitySharedId: z.string({ message: 'You should provide an Entity' }),
});

export class PXExtractParagraphsFromEntity implements UseCase<Input, Output> {
  constructor(private dependencies: Dependencies) {}

  async execute(input: Input): Promise<Output> {
    const { extractor, entity, installedLanguages } = await this.getInitialData(input);

    if (!extractor.canExtract(entity)) {
      throw new PXValidationError(
        PXErrorCode.ENTITY_INVALID,
        `The Entity "${entity.title}" does not have valid template configured by this Extractor`
      );
    }

    const documents = await this.getDocuments(entity, installedLanguages);

    const segmentations = await this.getSegmentations(documents);

    if (segmentations.length !== documents.length) {
      throw new PXValidationError(
        PXErrorCode.SEGMENTATIONS_UNAVAILABLE,
        `There are some Documents without Segmentations for the Entity "${entity.title}"`
      );
    }

    const defaultLanguage = installedLanguages.find(language => !!language.default)?.key!;

    await this.dependencies.extractionService.extractParagraph({
      documents,
      segmentations,
      defaultLanguage,
      extractionId: new PXExtractionId({
        entitySharedId: entity.sharedId,
        extractorId: extractor.id,
      }),
      xmlFilesPath: [],
    });
  }

  private async getInitialData(input: Input) {
    const [extractor, entities, installedLanguages] = await Promise.all([
      this.dependencies.extractorsDS.getById(input.extractorId),
      this.dependencies.entityDS.getByIds([input.entitySharedId]).all(),
      this.dependencies.settingsDS.getInstalledLanguages(),
    ]);
    const [entity] = entities;

    if (!extractor) {
      throw new PXValidationError(
        PXErrorCode.EXTRACTOR_NOT_FOUND,
        `Extractor with id "${input.extractorId}" was not found`
      );
    }

    if (!entity) {
      throw new PXValidationError(
        PXErrorCode.ENTITY_NOT_FOUND,
        `Entity with id "${input.extractorId}" was not found`
      );
    }

    if (!installedLanguages.length) {
      throw new PXValidationError(
        PXErrorCode.LANGUAGES_NOT_FOUND,
        'There is no languages available'
      );
    }

    return { extractor, entity, installedLanguages };
  }

  private async getDocuments(entity: Entity, installedLanguages: LanguagesListSchema) {
    const documents = await this.dependencies.filesDS.getDocumentsForEntity(entity.sharedId).all();

    const filteredDocuments = documents.filter(document =>
      installedLanguages.some(language => language.key === document.language)
    );

    if (!filteredDocuments.length) {
      throw new PXValidationError(
        PXErrorCode.DOCUMENTS_NOT_FOUND,
        `There is no valid Documents for the Entity ${entity.title}`
      );
    }

    return filteredDocuments;
  }

  private async getSegmentations(documents: Document[]) {
    const segmentations = await this.dependencies.filesDS
      .getSegmentations(documents.map(document => document.id))
      .all();

    return segmentations;
  }
}
