import { z } from 'zod';
import { UseCase } from 'api/common.v2/contracts/UseCase';
import { EntitiesDataSource } from 'api/entities.v2/contracts/EntitiesDataSource';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { FilesDataSource } from 'api/files.v2/contracts/FilesDataSource';
import { Entity } from 'api/entities.v2/model/Entity';
import { Document } from 'api/files.v2/model/Document';
import { LanguageISO6391 } from 'shared/types/commonTypes';

import { PXExtractorsDataSource } from '../domain/PXExtractorDataSource';
import { PXErrorCode, PXValidationError } from '../domain/PXValidationError';
import { PXExtractionService } from '../domain/PXExtractionService';

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
    await this.dependencies.extractionService.extractParagraph(segmentations!);
  }

  private async getInitialData(input: Input) {
    const [extractor, entities, installedLanguages] = await Promise.all([
      this.dependencies.extractorsDS.getById(input.extractorId),
      this.dependencies.entityDS.getByIds([input.entitySharedId]).all(),
      this.dependencies.settingsDS.getLanguageKeys(),
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

    return { extractor, entity, installedLanguages };
  }

  private async getDocuments(entity: Entity, installedLanguages: LanguageISO6391[]) {
    const documents = await this.dependencies.filesDS.getDocumentsForEntity(entity.sharedId).all();

    return documents.filter(document => installedLanguages.includes(document.language));
  }

  private async getSegmentations(documents: Document[]) {
    const segmentations = await this.dependencies.filesDS
      .getSegmentations(documents.map(document => document.id))
      .all();

    return segmentations;
  }
}

/**
 * The ExtractParagraphsFromEntityUseCase will be per Entity (entitySharedId)
 * 1. Get primary Documents for that Entity in the collection UI languages and only one per language
 * 2. The language of Primary Document must be configured on UI Languages collections
 *
 * 3. From PDF 'okay' to extract, search for pdf segmentations.
 *
 * Paragraph should be create with the title of the Entity in that UI language.Paragraph number
 *
 * 1. Fix type error behind mapping different languages
 * 2. Improve by refactoring
 * 3. Cover behavior by testing  [ OK ]
 * 4. query more than one segmentation  [ OK ]
 * 5. Throw if any segemnation if found. [ OK ]
 * 6. every segmentation should have XML
 *
 */
