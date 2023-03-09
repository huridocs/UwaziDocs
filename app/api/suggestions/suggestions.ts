import { FilterQuery } from 'mongoose';

import entities from 'api/entities/entities';
import { files } from 'api/files/files';
import settings from 'api/settings/settings';
import { IXSuggestionsModel } from 'api/suggestions/IXSuggestionsModel';
import templates from 'api/templates';
import {
  ExtractedMetadataSchema,
  LanguagesListSchema,
  ObjectIdSchema,
} from 'shared/types/commonTypes';
import { EntitySchema } from 'shared/types/entityType';
import { SuggestionState } from 'shared/types/suggestionSchema';
import { IXSuggestionsFilter, IXSuggestionType } from 'shared/types/suggestionType';
import { registerEventListeners } from './eventListeners';
import {
  getCurrentValueStage,
  getEntityStage,
  getFileStage,
  getLabeledValueStage,
  getMatchStage,
  groupByAndSort,
} from './pipelineStages';
import { getStats } from './stats';
import { updateStates } from './updateState';
import { ObjectId } from 'mongodb';

interface AcceptedSuggestion {
  _id: ObjectIdSchema;
  sharedId: string;
  entityId: string;
}

const updateEntitiesWithSuggestion = async (
  allLanguages: boolean,
  acceptedSuggestion: AcceptedSuggestion,
  suggestion: IXSuggestionType
) => {
  const query = allLanguages
    ? { sharedId: acceptedSuggestion.sharedId }
    : { sharedId: acceptedSuggestion.sharedId, _id: acceptedSuggestion.entityId };
  const storedEntities = await entities.get(query, '+permissions');
  const entitiesToUpdate =
    suggestion.propertyName !== 'title'
      ? storedEntities.map((entity: EntitySchema) => ({
          ...entity,
          metadata: {
            ...entity.metadata,
            [suggestion.propertyName]: [{ value: suggestion.suggestedValue }],
          },
          permissions: entity.permissions || [],
        }))
      : storedEntities.map((entity: EntitySchema) => ({
          ...entity,
          title: suggestion.suggestedValue,
        }));

  await entities.saveMultiple(entitiesToUpdate);
};

const updateExtractedMetadata = async (suggestion: IXSuggestionType) => {
  const fetchedFiles = await files.get({ _id: suggestion.fileId });

  if (!fetchedFiles?.length) return Promise.resolve();
  const file = fetchedFiles[0];

  file.extractedMetadata = file.extractedMetadata ? file.extractedMetadata : [];
  const extractedMetadata = file.extractedMetadata.find(
    (em: any) => em.name === suggestion.propertyName
  ) as ExtractedMetadataSchema;

  if (!extractedMetadata) {
    file.extractedMetadata.push({
      name: suggestion.propertyName,
      timestamp: Date(),
      selection: {
        text: suggestion.suggestedText || suggestion.suggestedValue?.toString(),
        selectionRectangles: suggestion.selectionRectangles,
      },
    });
  } else {
    extractedMetadata.timestamp = Date();
    extractedMetadata.selection = {
      text: suggestion.suggestedText || suggestion.suggestedValue?.toString(),
      selectionRectangles: suggestion.selectionRectangles,
    };
  }
  return files.save(file);
};

const buildListQuery = (
  filters: FilterQuery<IXSuggestionType>,
  setLanguages: LanguagesListSchema | undefined,
  offset: number,
  limit: number
) => {
  const pipeline = [
    ...getMatchStage(filters),
    { $sort: { date: 1, state: -1 } },
    { $skip: offset },
    { $limit: limit },
    ...getEntityStage(setLanguages!),
    ...getCurrentValueStage(),
    ...getFileStage(),
    ...getLabeledValueStage(),
    {
      $project: {
        entityId: '$entity._id',
        entityTemplateId: '$entity.template',
        sharedId: '$entity.sharedId',
        entityTitle: '$entity.title',
        fileId: 1,
        language: 1,
        propertyName: 1,
        extractorId: 1,
        suggestedValue: 1,
        segment: 1,
        currentValue: 1,
        state: 1,
        page: 1,
        date: 1,
        error: 1,
        labeledValue: 1,
        selectionRectangles: 1,
      },
    },
  ];
  return pipeline;
};

const buildTemplateAggregationsQuery = (_filters: FilterQuery<IXSuggestionType>) => {
  const { entityTemplate, ...filters } = _filters;
  const pipeline = [...getMatchStage(filters), ...groupByAndSort('$entityTemplate')];
  return pipeline;
};

const buildStateAggregationsQuery = (_filters: FilterQuery<IXSuggestionType>) => {
  const { state, ...filters } = _filters;
  const pipeline = [...getMatchStage(filters), ...groupByAndSort('$state')];
  return pipeline;
};

const fetchAndAggregateSuggestions = async (
  _filters: Omit<IXSuggestionsFilter, 'language'>,
  setLanguages: LanguagesListSchema | undefined,
  offset: number,
  limit: number
) => {
  const {
    states,
    entityTemplates,
    ...filters
  }: {
    states?: string[];
    entityTemplates?: string[];
    extractorId?: ObjectIdSchema;
    state?: { $in: string[] };
    entityTemplate?: { $in: string[] };
  } = _filters;
  if (states) filters.state = { $in: _filters.states || [] };
  if (entityTemplates) filters.entityTemplate = { $in: _filters.entityTemplates || [] };

  const count = await IXSuggestionsModel.db
    .aggregate([{ $match: { ...filters, status: { $ne: 'processing' } } }, { $count: 'count' }])
    .then(result => (result?.length ? result[0].count : 0));

  const suggestions = await IXSuggestionsModel.db.aggregate(
    buildListQuery(filters, setLanguages, offset, limit)
  );

  const templateAggregations = await IXSuggestionsModel.db.aggregate(
    buildTemplateAggregationsQuery(filters)
  );

  const stateAggregations = await IXSuggestionsModel.db.aggregate(
    buildStateAggregationsQuery(filters)
  );

  return {
    suggestions,
    aggregations: { template: templateAggregations, state: stateAggregations },
    totalPages: Math.ceil(count / limit),
  };
};

const Suggestions = {
  getById: async (id: ObjectIdSchema) => IXSuggestionsModel.getById(id),
  getByEntityId: async (sharedId: string) => IXSuggestionsModel.get({ entityId: sharedId }),
  getByExtractor: async (extractorId: ObjectIdSchema) => IXSuggestionsModel.get({ extractorId }),

  get: async (filter: IXSuggestionsFilter, options: { page: { size: number; number: number } }) => {
    const offset = options && options.page ? options.page.size * (options.page.number - 1) : 0;
    const DEFAULT_LIMIT = 30;
    const limit = options.page?.size || DEFAULT_LIMIT;
    const { languages: setLanguages } = await settings.get();
    const { language, ...filters } = filter;
    filters.extractorId = new ObjectId(filter.extractorId);

    return fetchAndAggregateSuggestions(filters, setLanguages, offset, limit);
  },

  getStats,

  updateStates,

  setObsolete: async (query: any) =>
    IXSuggestionsModel.updateMany(query, { $set: { state: SuggestionState.obsolete } }),

  save: async (suggestion: IXSuggestionType) => Suggestions.saveMultiple([suggestion]),

  saveMultiple: async (_suggestions: IXSuggestionType[]) => {
    const toSave: IXSuggestionType[] = [];
    const toSaveAndUpdate: IXSuggestionType[] = [];
    _suggestions.forEach(s => {
      if (s.status === 'failed') {
        toSave.push({ ...s, state: SuggestionState.error });
      } else if (s.status === 'processing') {
        toSave.push({ ...s, state: SuggestionState.processing });
      } else {
        toSaveAndUpdate.push(s);
      }
    });
    await IXSuggestionsModel.saveMultiple(toSave);
    const toUpdate = await IXSuggestionsModel.saveMultiple(toSaveAndUpdate);
    if (toUpdate.length) await updateStates({ _id: { $in: toUpdate.map(s => s._id) } });
  },

  accept: async (acceptedSuggestion: AcceptedSuggestion, allLanguages: boolean) => {
    const suggestion = await IXSuggestionsModel.getById(acceptedSuggestion._id);
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }
    if (suggestion.error !== '') {
      throw new Error('Suggestion has an error');
    }
    let shouldUpdateAllLanguages = allLanguages;
    const property = await templates.getPropertyByName(suggestion.propertyName);
    if (property && ['numeric', 'date'].includes(property.type)) {
      shouldUpdateAllLanguages = true;
    }
    await updateEntitiesWithSuggestion(shouldUpdateAllLanguages, acceptedSuggestion, suggestion);
    await updateExtractedMetadata(suggestion);
    await Suggestions.updateStates({ _id: acceptedSuggestion._id });
  },

  deleteByEntityId: async (sharedId: string) => {
    await IXSuggestionsModel.delete({ entityId: sharedId });
  },

  delete: IXSuggestionsModel.delete.bind(IXSuggestionsModel),
  registerEventListeners,
};

export { Suggestions };
