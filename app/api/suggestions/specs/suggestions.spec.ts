/* eslint-disable max-statements */
import db from 'api/utils/testing_db';

import {
  EntitySuggestionType,
  IXSuggestionStateType,
  IXSuggestionType,
  IXSuggestionsFilter,
} from 'shared/types/suggestionType';
import { Suggestions } from '../suggestions';
import {
  factory,
  file2Id,
  file3Id,
  fixtures,
  personTemplateId,
  shared2enId,
  shared2esId,
  suggestionId,
  shared2AgeSuggestionId,
} from './fixtures';

const getSuggestions = async (filter: IXSuggestionsFilter, size = 5) =>
  Suggestions.get(filter, { page: { size, number: 1 } });

const findOneSuggestion = async (query: any): Promise<IXSuggestionType> =>
  db.mongodb
    ?.collection('ixsuggestions')
    .findOne({ ...query }) as unknown as Promise<IXSuggestionType>;

const stateUpdateCases: {
  state: Partial<IXSuggestionStateType>;
  reason: string;
  suggestionQuery: any;
}[] = [
  {
    state: { obsolete: true },
    reason: 'obsolete, if the suggestion is older than the model',
    suggestionQuery: { entityId: 'shared5', propertyName: 'age' },
  },
  {
    state: {
      withValue: true,
      withSuggestion: false,
      labeled: false,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if entity value exists, file label is empty, suggestion is empty',
    suggestionQuery: { entityId: 'shared3', propertyName: 'age' },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: true,
      match: true,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if file label exists, suggestion and entity value exist and match',
    suggestionQuery: {
      entityId: 'shared2',
      propertyName: 'super_powers',
      language: 'en',
      status: 'ready',
    },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: true,
      match: true,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason:
      'when property is a date, and if file label exists, suggestion and entity value exist and match',
    suggestionQuery: {
      entityId: 'shared7',
      propertyName: 'first_encountered',
      language: 'es',
    },
  },
  {
    state: {
      labeled: false,
      withValue: false,
      withSuggestion: false,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if entity value, file label, suggestion are all empty',
    suggestionQuery: {
      entityId: 'shared8',
      propertyName: 'enemy',
      language: 'en',
    },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: false,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if entity value and file label exists, suggestion is empty',
    suggestionQuery: {
      entityId: 'shared6',
      propertyName: 'enemy',
      language: 'en',
      fileId: { $exists: true },
    },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: false,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason:
      'when property is a date, and if entity value and file label exists, suggestion is empty',
    suggestionQuery: {
      entityId: 'shared7',
      propertyName: 'first_encountered',
      language: 'en',
    },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: true,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if file label exists, suggestion and entity value exist but do not match',
    suggestionQuery: {
      propertyName: 'super_powers',
      language: 'es',
    },
  },
  {
    state: {
      labeled: true,
      withValue: true,
      withSuggestion: true,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason:
      'when property is a date, if file label exists, suggestion and entity value exist but do not match',
    suggestionQuery: {
      entityId: 'shared7',
      propertyName: 'first_encountered',
      language: 'pr',
    },
  },
  {
    state: {
      labeled: false,
      withValue: true,
      withSuggestion: true,
      match: true,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if file label is empty, but suggestion and entity value exist and match',
    suggestionQuery: {
      entityId: 'shared1',
      propertyName: 'enemy',
    },
  },
  {
    state: {
      labeled: false,
      withValue: true,
      withSuggestion: true,
      match: true,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason:
      'when property is a date, and if file label is empty, but suggestion and entity value exist and match',
    suggestionQuery: {
      entityId: 'shared8',
      propertyName: 'first_encountered',
      language: 'en',
    },
  },
  {
    state: {
      labeled: false,
      withValue: true,
      withSuggestion: true,
      match: false,
      obsolete: false,
      processing: false,
      error: false,
    },
    reason: 'if file label is empty, suggestion and entity value exist but do not match',
    suggestionQuery: {
      entityId: 'shared6',
      propertyName: 'enemy',
      language: 'en',
    },
  },
];

const newProcessingSuggestion: IXSuggestionType = {
  entityId: 'new_processing_suggestion',
  entityTemplate: personTemplateId.toString(),
  propertyName: 'new',
  extractorId: factory.id('new_extractor'),
  suggestedValue: 'new',
  segment: 'Some new segment',
  language: 'en',
  date: 5,
  page: 2,
  status: 'processing',
  error: '',
};

const newErroringSuggestion: IXSuggestionType = {
  entityId: 'new_erroring_suggestion',
  entityTemplate: personTemplateId.toString(),
  propertyName: 'new',
  extractorId: factory.id('new_extractor'),
  suggestedValue: 'new',
  segment: 'Some new segment',
  language: 'en',
  date: 5,
  page: 2,
  status: 'failed',
  error: 'Some error message',
};

describe('suggestions', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext(fixtures);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('get()', () => {
    beforeEach(async () => {
      await Suggestions.updateStates({});
    });

    it('should not fail on 0 suggestions', async () => {
      const { suggestions } = await Suggestions.get(
        { extractorId: factory.id('non_existing_extractor').toString() },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions.length).toBe(0);
    });

    it('should return all title suggestions', async () => {
      const { suggestions } = await Suggestions.get(
        { extractorId: factory.id('title_extractor').toString() },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions.length).toBe(6);
    });

    it('should return total page count', async () => {
      const { totalPages } = await Suggestions.get(
        { extractorId: factory.id('title_extractor').toString() },
        { page: { size: 50, number: 1 } }
      );
      expect(totalPages).toBe(1);
    });

    it('should be able to filter', async () => {
      const { suggestions } = await Suggestions.get(
        {
          extractorId: factory.id('super_powers_extractor').toString(),
        },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions.length).toBe(2);
    });

    it('should return suggestion and extra entity information', async () => {
      const { suggestions } = await Suggestions.get(
        { extractorId: factory.id('super_powers_extractor').toString() },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions).toMatchObject([
        {
          fileId: file2Id,
          propertyName: 'super_powers',
          extractorId: factory.id('super_powers_extractor'),
          suggestedValue: 'scientific knowledge',
          segment: 'he relies on his own scientific knowledge',
          language: 'en',
          date: 4,
          page: 5,
          currentValue: 'scientific knowledge',
          labeledValue: 'scientific knowledge',
          state: {
            labeled: true,
            withValue: true,
            withSuggestion: true,
            match: true,
            hasContext: true,
            obsolete: false,
            processing: false,
            error: false,
          },
          entityId: shared2enId,
          sharedId: 'shared2',
          entityTitle: 'Batman en',
        },
        {
          fileId: file3Id,
          propertyName: 'super_powers',
          extractorId: factory.id('super_powers_extractor'),
          suggestedValue: 'scientific knowledge es',
          segment: 'el confía en su propio conocimiento científico',
          language: 'es',
          date: 4,
          page: 5,
          currentValue: 'conocimiento científico',
          labeledValue: 'conocimiento científico',
          state: {
            labeled: true,
            withValue: true,
            withSuggestion: true,
            match: false,
            hasContext: true,
            obsolete: false,
            processing: false,
            error: false,
          },
          entityId: shared2esId,
          sharedId: 'shared2',
          entityTitle: 'Batman es',
        },
      ]);
    });

    it('should return match status', async () => {
      const { suggestions: superPowersSuggestions } = await getSuggestions({
        extractorId: factory.id('super_powers_extractor').toString(),
      });

      expect(
        superPowersSuggestions.find((s: EntitySuggestionType) => s.language === 'en').state
      ).toEqual({
        labeled: true,
        withValue: true,
        withSuggestion: true,
        match: true,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      const { suggestions: enemySuggestions } = await getSuggestions(
        { extractorId: factory.id('enemy_extractor').toString() },
        6
      );

      expect(
        enemySuggestions.filter(
          (s: EntitySuggestionType) => s.sharedId === 'shared6' && s.language === 'en'
        )[1].state
      ).toEqual({
        labeled: false,
        withValue: true,
        withSuggestion: true,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      expect(
        enemySuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared1').state
      ).toEqual({
        labeled: false,
        withValue: true,
        withSuggestion: true,
        match: true,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      expect(
        enemySuggestions.find(
          (s: EntitySuggestionType) => s.sharedId === 'shared8' && s.language === 'en'
        ).state
      ).toEqual({
        labeled: false,
        withValue: false,
        withSuggestion: false,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      const { suggestions: ageSuggestions } = await getSuggestions({
        extractorId: factory.id('age_extractor').toString(),
      });

      expect(ageSuggestions.length).toBe(4);
      expect(
        ageSuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared5').state.obsolete
      ).toEqual(true);

      expect(
        ageSuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared3').state
      ).toEqual({
        labeled: false,
        withValue: true,
        withSuggestion: false,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });
    });

    it('should return mismatch status', async () => {
      const { suggestions: superPowersSuggestions } = await getSuggestions({
        extractorId: factory.id('super_powers_extractor').toString(),
      });
      expect(
        superPowersSuggestions.find((s: EntitySuggestionType) => s.language === 'es').state
      ).toEqual({
        labeled: true,
        withValue: true,
        withSuggestion: true,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      const { suggestions: enemySuggestions } = await getSuggestions({
        extractorId: factory.id('enemy_extractor').toString(),
      });
      expect(
        enemySuggestions.find(
          (s: EntitySuggestionType) => s.sharedId === 'shared6' && s.language === 'en'
        ).state
      ).toEqual({
        labeled: true,
        withValue: true,
        withSuggestion: false,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });

      expect(
        enemySuggestions.find(
          (s: EntitySuggestionType) => s.sharedId === 'shared9' && s.language === 'en'
        ).state
      ).toEqual({
        labeled: false,
        withValue: false,
        withSuggestion: true,
        match: false,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });
    });

    it('should return error status', async () => {
      const { suggestions } = await getSuggestions({
        extractorId: factory.id('age_extractor').toString(),
      });
      expect(
        suggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared4').state.error
      ).toBe(true);
    });
  });

  describe('accept()', () => {
    beforeEach(async () => {
      await Suggestions.updateStates({});
    });

    it('should accept a suggestion', async () => {
      const { suggestions } = await getSuggestions({
        extractorId: factory.id('super_powers_extractor').toString(),
      });
      const labelMismatchedSuggestion = suggestions.find(
        (sug: any) => sug.state.labeled && !sug.state.match
      );
      await Suggestions.accept(
        {
          _id: suggestionId,
          sharedId: labelMismatchedSuggestion.sharedId,
          entityId: labelMismatchedSuggestion.entityId,
        },
        false
      );
      const { suggestions: newSuggestions } = await getSuggestions({
        extractorId: factory.id('super_powers_extractor').toString(),
      });
      const changedSuggestion = newSuggestions.find(
        (sg: any) => sg._id.toString() === suggestionId.toString()
      );

      expect(changedSuggestion.state).toEqual({
        labeled: true,
        withValue: true,
        withSuggestion: true,
        match: true,
        hasContext: true,
        obsolete: false,
        processing: false,
        error: false,
      });
      expect(changedSuggestion.suggestedValue).toEqual(changedSuggestion.labeledValue);
    });
    it('should not accept a suggestion with an error', async () => {
      const { suggestions } = await getSuggestions({
        extractorId: factory.id('age_extractor').toString(),
      });
      const errorSuggestion = suggestions.find(
        (s: EntitySuggestionType) => s.sharedId === 'shared4'
      );
      try {
        await Suggestions.accept(
          {
            _id: errorSuggestion._id,
            sharedId: errorSuggestion.sharedId,
            entityId: errorSuggestion.entityId,
          },
          true
        );
      } catch (e: any) {
        expect(e?.message).toBe('Suggestion has an error');
      }
    });
    it('should update entities of all languages if property name is numeric or date', async () => {
      const { suggestions } = await getSuggestions({
        extractorId: factory.id('age_extractor').toString(),
      });
      const shared2Suggestion = suggestions.find(sug => sug.sharedId === 'shared2');
      await Suggestions.accept(
        {
          _id: shared2AgeSuggestionId,
          sharedId: shared2Suggestion.sharedId,
          entityId: shared2Suggestion.entityId,
        },
        false
      );

      const entities = await db.mongodb
        ?.collection('entities')
        .find({ sharedId: shared2Suggestion.sharedId })
        .toArray();

      const propertyValues = entities?.map(entity => entity.metadata.age);
      expect(propertyValues).not.toBe(undefined);
      const ages = propertyValues?.map(value => value[0].value) as string[];
      expect(ages[0]).toEqual('20');
      expect(ages[1]).toEqual('20');
      expect(ages[2]).toEqual('20');
    });
  });

  describe('save()', () => {
    describe('on suggestion status error', () => {
      it('should mark error in state as well', async () => {
        await Suggestions.save(newErroringSuggestion);
        expect(await findOneSuggestion({ entityId: 'new_erroring_suggestion' })).toMatchObject({
          ...newErroringSuggestion,
          state: {
            error: true,
          },
        });
        const original = await findOneSuggestion({});
        const changed: IXSuggestionType = { ...original, status: 'failed' };
        await Suggestions.save(changed);
        expect(await findOneSuggestion({ _id: original._id })).toMatchObject({
          ...changed,
          state: {
            error: true,
          },
        });
      });
    });

    describe('on suggestion status processing', () => {
      it('should mark processing in state as well', async () => {
        await Suggestions.save(newProcessingSuggestion);
        expect(await findOneSuggestion({ entityId: 'new_processing_suggestion' })).toMatchObject({
          ...newProcessingSuggestion,
          state: {
            processing: true,
          },
        });
        const original = await findOneSuggestion({});
        const changed: IXSuggestionType = { ...original, status: 'processing' };
        await Suggestions.save(changed);
        expect(await findOneSuggestion({ _id: original._id })).toMatchObject({
          ...changed,
          state: {
            processing: true,
          },
        });
      });
    });
  });

  describe('updateStates()', () => {
    it.each(stateUpdateCases)('should mark $reason', async ({ state, suggestionQuery }) => {
      const original = await findOneSuggestion(suggestionQuery);
      const idQuery = { _id: original._id };
      await Suggestions.updateStates(idQuery);
      const changed = await findOneSuggestion(idQuery);
      expect(changed).toMatchObject({
        ...original,
        state,
      });
    });
  });

  describe('setObsolete()', () => {
    it('should set the queried suggestions to obsolete state', async () => {
      const query = { entityId: 'shared1' };
      await Suggestions.setObsolete(query);
      const obsoletes = await db.mongodb?.collection('ixsuggestions').find(query).toArray();
      expect(obsoletes?.every(s => s.state.obsolete)).toBe(true);
      expect(obsoletes?.length).toBe(3);
    });
  });

  describe('markSuggestionsWithoutSegmentation()', () => {
    it('should mark the suggestions without segmentation to error state', async () => {
      const query = { entityId: 'shared1' };
      await Suggestions.markSuggestionsWithoutSegmentation(query);
      const notSegmented = await db.mongodb?.collection('ixsuggestions').find(query).toArray();
      expect(notSegmented?.every(s => s.state.error)).toBe(true);
    });

    it('should not mark suggestions when segmentations are correct', async () => {
      const query = { entityId: 'shared2' };
      await Suggestions.markSuggestionsWithoutSegmentation(query);
      const segmented = await db.mongodb
        ?.collection('ixsuggestions')
        .find({ _id: suggestionId })
        .toArray();
      const notSegmented = await db.mongodb
        ?.collection('ixsuggestions')
        .find({ _id: shared2AgeSuggestionId })
        .toArray();
      expect(segmented?.length).toBe(1);
      expect(segmented?.every(s => s.state?.error)).toBe(false);
      expect(notSegmented?.length).toBe(1);
      expect(notSegmented?.every(s => s.state.error)).toBe(true);
    });
  });

  describe('saveMultiple()', () => {
    it('should handle everything at once', async () => {
      const originals = await Promise.all(
        stateUpdateCases.map(async ({ suggestionQuery }) => findOneSuggestion(suggestionQuery))
      );
      const newSuggestions = [newErroringSuggestion, newProcessingSuggestion];
      const toSave = originals.concat(newSuggestions);

      await Suggestions.saveMultiple(toSave);

      const changedSuggestions = await Promise.all(
        stateUpdateCases.map(async ({ suggestionQuery }) => findOneSuggestion(suggestionQuery))
      );

      for (let i = 0; i < stateUpdateCases.length; i += 1) {
        const original = originals[i];
        const { state } = stateUpdateCases[i];
        const changed = changedSuggestions[i];
        expect(changed).toMatchObject({
          ...original,
          state,
        });
      }

      expect(await findOneSuggestion({ entityId: newErroringSuggestion.entityId })).toMatchObject({
        ...newErroringSuggestion,
        state: {
          error: true,
        },
      });
      expect(await findOneSuggestion({ entityId: newProcessingSuggestion.entityId })).toMatchObject(
        {
          ...newProcessingSuggestion,
          state: {
            processing: true,
          },
        }
      );
    });
  });
});
