import { ObjectIdSchema } from 'shared/types/commonTypes';
import { IXExtractorType } from 'shared/types/extractorType';
import { LanguageUtils } from 'shared/language';
import { propertyTypeIsMultiValued } from 'api/services/informationextraction/getFiles';
import { files } from 'api/files';
import { Suggestion } from '../domain/models/Suggestion';
import { SuggestionRepository } from '../infrastructure/repositories/SuggestionRepository';

export class BlankSuggestionsCreator {
  constructor(private suggestionRepository: SuggestionRepository) {}

  async createForTemplates(
    extractor: IXExtractorType,
    selectedTemplates: ObjectIdSchema[],
    defaultLanguage: string,
    propertyType: string,
    entitiesSharedIds: string[]
  ): Promise<void> {
    const fetchedFiles = await files.get(
      { entity: { $in: entitiesSharedIds }, type: 'document' },
      '_id entity language extractedMetadata'
    );

    const suggestions = fetchedFiles
      .filter(file => file.entity)
      .map(file => 
        Suggestion.createBlank({
          language: file.language
            ? LanguageUtils.fromISO639_3(file.language, false)?.ISO639_1 || defaultLanguage
            : defaultLanguage,
          fileId: file._id,
          entityId: file.entity!,
          entityTemplate: selectedTemplates[0].toString(),
          extractorId: extractor._id,
          propertyName: extractor.property,
          suggestedValue: propertyTypeIsMultiValued(propertyType) ? [] : '',
        })
      );

    await this.suggestionRepository.saveMultiple(suggestions);
  }
} 
