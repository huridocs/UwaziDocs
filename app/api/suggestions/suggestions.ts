/* eslint-disable max-lines */
/* eslint-disable no-await-in-loop */
import entities from 'api/entities/entities';
import { files } from 'api/files/files';
import settings from 'api/settings/settings';
import { IXSuggestionsModel } from 'api/suggestions/IXSuggestionsModel';
import { IXSuggestionsFilter, IXSuggestionType } from 'shared/types/suggestionType';
import { EntitySchema } from 'shared/types/entityType';
import { ExtractedMetadataSchema, ObjectIdSchema } from 'shared/types/commonTypes';
import { SuggestionState } from 'shared/types/suggestionSchema';
import { updateStates } from './updateState';
//update flows:
// - suggestions (i.e. messages from the service - convention: suggestions are unique for file+property)
//    - save, saveMultiple (done, tested)
//    - accept (done, tested)
// - related model (match by propertyName) - raw mongoose model, no manager object - created ixmodels
//    - save, but only when ready, not processing (see usages of IXModelsModel.save) - ixmodels.save, done, tested
//    - delete - skip since no usage?
// - file (match through fileId) (what can change? who changes it?)
//    - save - update conditioned on extractedMetadata change - done, tested
//    - delete (should delete the suggestion) - done, tested
// - entity (match through entityId)
//    - save
//    - delete (done, already handled by previous implementation, it deletes the suggestion)
// - templates - what happens to this (ix in general), when a property is renamed?

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
export const Suggestions = {
  getById: async (id: ObjectIdSchema) => IXSuggestionsModel.getById(id),
  getByEntityId: async (sharedId: string) => IXSuggestionsModel.get({ entityId: sharedId }),
  // eslint-disable-next-line max-statements
  get: async (filter: IXSuggestionsFilter, options: { page: { size: number; number: number } }) => {
    const offset = options && options.page ? options.page.size * (options.page.number - 1) : 0;
    const DEFAULT_LIMIT = 30;
    const limit = options.page?.size || DEFAULT_LIMIT;
    const { languages } = await settings.get();
    // @ts-ignore
    const defaultLanguage = languages.find(l => l.default).key;
    //@ts-ignore
    const configuredLanguages = languages.map(l => l.key);
    const { language, ...filters } = filter;

    const [{ count }] = await IXSuggestionsModel.db.aggregate([
      { $match: { ...filters, status: { $ne: 'processing' } } },
      { $count: 'count' },
    ]);

    const suggestions = await IXSuggestionsModel.db.aggregate([
      { $match: { ...filters, status: { $ne: 'processing' } } },
      { $sort: { date: 1, state: -1 } }, // sort still needs to be before offset and limit
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: 'entities',
          let: {
            localFieldEntityId: '$entityId',
            localFieldLanguage: {
              $cond: [
                {
                  $not: [{ $in: ['$language', configuredLanguages] }],
                },
                defaultLanguage,
                '$language',
              ],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sharedId', '$$localFieldEntityId'] },
                    { $eq: ['$language', '$$localFieldLanguage'] },
                  ],
                },
              },
            },
          ],
          as: 'entity',
        },
      },
      {
        $addFields: { entity: { $arrayElemAt: ['$entity', 0] } },
      },
      {
        $addFields: {
          currentValue: {
            $cond: [
              { $eq: ['$propertyName', 'title'] },
              { v: [{ value: '$entity.title' }] },
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: {
                        $objectToArray: '$entity.metadata',
                      },
                      as: 'property',
                      cond: {
                        $eq: ['$$property.k', '$propertyName'],
                      },
                    },
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          currentValue: { $arrayElemAt: ['$currentValue.v', 0] },
        },
      },
      {
        $addFields: {
          currentValue: { $ifNull: ['$currentValue.value', ''] },
        },
      },
      {
        $lookup: {
          from: 'files',
          let: {
            localFieldFileId: '$fileId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$localFieldFileId'],
                },
              },
            },
          ],
          as: 'file',
        },
      },
      {
        $addFields: { file: { $arrayElemAt: ['$file', 0] } },
      },
      {
        $addFields: {
          labeledValue: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$file.extractedMetadata',
                  as: 'label',
                  cond: {
                    $eq: ['$propertyName', '$$label.name'],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          labeledValue: '$labeledValue.selection.text',
        },
      },
      {
        $project: {
          entityId: '$entity._id',
          sharedId: '$entity.sharedId',
          entityTitle: '$entity.title',
          fileId: 1,
          language: 1,
          propertyName: 1,
          suggestedValue: 1,
          segment: 1,
          currentValue: 1,
          state: 1,
          page: 1,
          date: 1,
          labeledValue: 1,
        },
      },
    ]);

    const totalPages = Math.ceil(count / limit);
    return { suggestions, totalPages };
  },

  updateStates,

  setObsolete: async (query: any) =>
    IXSuggestionsModel.updateMany(query, { $set: { state: SuggestionState.obsolete } }),

  save: async (suggestion: IXSuggestionType) => Suggestions.saveMultiple([suggestion]),

  saveMultiple: async (_suggestions: IXSuggestionType[]) => {
    const toSave: IXSuggestionType[] = [];
    const update: IXSuggestionType[] = [];
    _suggestions.forEach(s => {
      if (s.status === 'failed') {
        toSave.push({ ...s, state: SuggestionState.error });
      } else if (s.status === 'processing') {
        toSave.push({ ...s, state: SuggestionState.processing });
      } else {
        toSave.push(s);
        update.push(s);
      }
    });
    await IXSuggestionsModel.saveMultiple(toSave);
    if (update.length > 0) await updateStates({ _id: { $in: update.map(s => s._id) } });
  },

  accept: async (acceptedSuggestion: AcceptedSuggestion, allLanguages: boolean) => {
    const suggestion = await IXSuggestionsModel.getById(acceptedSuggestion._id);
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }
    if (suggestion.error !== '') {
      throw new Error('Suggestion has an error');
    }
    await updateEntitiesWithSuggestion(allLanguages, acceptedSuggestion, suggestion);
    await updateExtractedMetadata(suggestion);
    await Suggestions.updateStates({ _id: acceptedSuggestion._id });
  },

  deleteByEntityId: async (sharedId: string) => {
    await IXSuggestionsModel.delete({ entityId: sharedId });
  },

  deleteByProperty: async (propertyName: string, templateId: string) => {
    const cursor = IXSuggestionsModel.db.find({ propertyName }).cursor();

    for (let suggestion = await cursor.next(); suggestion; suggestion = await cursor.next()) {
      const sharedId = suggestion.entityId;
      // eslint-disable-next-line no-await-in-loop
      const [entity] = await entities.getUnrestricted({ sharedId });
      if (entity && entity.template?.toString() === templateId) {
        // eslint-disable-next-line no-await-in-loop
        await IXSuggestionsModel.delete({ _id: suggestion._id });
      }
    }
  },
  delete: IXSuggestionsModel.delete.bind(IXSuggestionsModel),
};
