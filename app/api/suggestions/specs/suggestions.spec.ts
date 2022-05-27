import { catchErrors } from 'api/utils/jasmineHelpers';
import db from 'api/utils/testing_db';

import { IXSuggestionsModel } from 'api/suggestions/IXSuggestionsModel';
import { EntitySuggestionType, IXSuggestionType } from 'shared/types/suggestionType';
import { SuggestionState } from 'shared/types/suggestionSchema';
import { Suggestions } from '../suggestions';
import { fixtures, personTemplateId, suggestionId } from './fixtures';

const getSuggestions = async (propertyName: string) =>
  Suggestions.get({ propertyName }, { page: { size: 5, number: 1 } });

const findOneSuggestion = async (query: any) =>
  db.mongodb?.collection('ixsuggestions').findOne({ ...query });

const stateUpdateCases = [
  {
    state: 'obsolete',
    reason: 'the suggestion is older than model',
    suggestionQuery: { entityId: 'shared5', propertyName: 'age' },
  },
  {
    state: 'valueEmpty',
    reason: 'labeled, suggested value is empty but not current value',
    suggestionQuery: { entityId: 'shared3', propertyName: 'age' },
  },
  {
    state: 'labelMatch',
    reason: 'values match',
    suggestionQuery: {
      entityId: 'shared2',
      propertyName: 'super_powers',
      language: 'en',
      status: 'ready',
    },
  },
  {
    state: 'empty',
    reason: 'current and suggested values are empty',
    suggestionQuery: {
      entityId: 'shared6',
      propertyName: 'enemy',
      language: 'es',
    },
  },
  {
    state: 'labelEmpty',
    reason: '< case not clear >',
    suggestionQuery: {
      entityId: 'shared6',
      propertyName: 'enemy',
      language: 'en',
      fileId: { $exists: true },
    },
  },
  {
    state: 'labelMismatch',
    reason: 'labeledValue and suggestedValue differ',
    suggestionQuery: {
      propertyName: 'super_powers',
      language: 'es',
    },
  },
  {
    state: 'valueMatch',
    reason: 'suggested and current values match',
    suggestionQuery: {
      entityId: 'shared1',
      propertyName: 'enemy',
    },
  },
  {
    state: 'valueMismatch',
    reason: 'suggested and current values differ',
    suggestionQuery: {
      entityId: 'shared6',
      propertyName: 'enemy',
      language: 'en',
    },
  },
];

const newProcessingSuggestion: IXSuggestionType = {
  entityId: 'new_processing_suggestion',
  propertyName: 'new',
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
  propertyName: 'new',
  suggestedValue: 'new',
  segment: 'Some new segment',
  language: 'en',
  date: 5,
  page: 2,
  status: 'failed',
  error: '',
};

describe('suggestions', () => {
  beforeEach(done => {
    db.clearAllAndLoad(fixtures).then(done).catch(catchErrors(done));
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('deleteByProperty()', () => {
    it('should delete all suggestions of a given property', async () => {
      const suggestions = await IXSuggestionsModel.get({ propertyName: 'title' });
      expect(suggestions.length).toBe(6);

      await Suggestions.deleteByProperty('title', personTemplateId.toString());
      const newSuggestions = await IXSuggestionsModel.get({ propertyName: 'title' });
      expect(newSuggestions.length).toBe(2);
    });
  });

  describe('get()', () => {
    it('should return all title suggestions', async () => {
      const { suggestions } = await Suggestions.get(
        { propertyName: 'title' },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions.length).toBe(6);
    });

    it('should be able to filter', async () => {
      const { suggestions } = await Suggestions.get(
        { propertyName: 'super_powers' },
        { page: { size: 50, number: 1 } }
      );
      expect(suggestions.length).toBe(2);
    });

    it('should return match status', async () => {
      const { suggestions: superPowersSuggestions } = await getSuggestions('super_powers');

      expect(
        superPowersSuggestions.find((s: EntitySuggestionType) => s.language === 'en').state
      ).toBe(SuggestionState.labelMatch);

      const { suggestions: enemySuggestions } = await getSuggestions('enemy');

      expect(
        enemySuggestions.filter(
          (s: EntitySuggestionType) => s.sharedId === 'shared6' && s.language === 'en'
        )[1].state
      ).toBe(SuggestionState.labelEmpty);

      expect(
        enemySuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared1').state
      ).toBe(SuggestionState.valueMatch);

      expect(
        enemySuggestions.find(
          (s: EntitySuggestionType) => s.sharedId === 'shared6' && s.language === 'es'
        ).state
      ).toBe(SuggestionState.empty);

      const { suggestions: ageSuggestions } = await getSuggestions('age');

      expect(ageSuggestions.length).toBe(3);
      expect(ageSuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared5').state).toBe(
        SuggestionState.obsolete
      );

      expect(ageSuggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared3').state).toBe(
        SuggestionState.valueEmpty
      );
    });

    it('should return mismatch status', async () => {
      const { suggestions: superPowersSuggestions } = await getSuggestions('super_powers');
      expect(
        superPowersSuggestions.find((s: EntitySuggestionType) => s.language === 'es').state
      ).toBe(SuggestionState.labelMismatch);

      const { suggestions: enemySuggestions } = await getSuggestions('enemy');
      expect(
        enemySuggestions.find(
          (s: EntitySuggestionType) => s.sharedId === 'shared6' && s.language === 'en'
        ).state
      ).toBe(SuggestionState.valueMismatch);
    });

    it('should return error status', async () => {
      const { suggestions } = await getSuggestions('age');
      expect(suggestions.find((s: EntitySuggestionType) => s.sharedId === 'shared4').state).toBe(
        SuggestionState.error
      );
    });
  });

  describe('accept()', () => {
    it('should accept a suggestion', async () => {
      const { suggestions } = await getSuggestions('super_powers');
      const labelMismatchedSuggestion = suggestions.find(
        (sug: any) => sug.state === SuggestionState.labelMismatch
      );
      await Suggestions.accept(
        {
          _id: suggestionId,
          sharedId: labelMismatchedSuggestion.sharedId,
          entityId: labelMismatchedSuggestion.entityId,
        },
        false
      );
      const { suggestions: newSuggestions } = await getSuggestions('super_powers');
      const changedSuggestion = newSuggestions.find(
        (sg: any) => sg._id.toString() === suggestionId.toString()
      );

      expect(changedSuggestion.state).toBe(SuggestionState.labelMatch);
      expect(changedSuggestion.suggestedValue).toEqual(changedSuggestion.labeledValue);
    });
    it('should not accept a suggestion with an error', async () => {
      const { suggestions } = await getSuggestions('age');
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
      } catch (e) {
        expect(e.message).toBe('Suggestion has an error');
      }
    });
  });

  describe('save()', () => {
    describe('on suggestion status error', () => {
      it('should mark error in state as well', async () => {
        await Suggestions.save(newErroringSuggestion);
        expect(await findOneSuggestion({ entityId: 'new_erroring_suggestion' })).toMatchObject({
          ...newErroringSuggestion,
          state: SuggestionState.error,
        });
        const original = await findOneSuggestion({});
        const changed: IXSuggestionType = { ...original, status: 'failed' };
        await Suggestions.save(changed);
        expect(await findOneSuggestion({ _id: original._id })).toMatchObject({
          ...changed,
          state: SuggestionState.error,
        });
      });
    });

    describe('on suggestion status processing', () => {
      it('should mark processing in state as well', async () => {
        await Suggestions.save(newProcessingSuggestion);
        expect(await findOneSuggestion({ entityId: 'new_processing_suggestion' })).toMatchObject({
          ...newProcessingSuggestion,
          state: 'Processing',
        });
        const original = await findOneSuggestion({});
        const changed: IXSuggestionType = { ...original, status: 'processing' };
        await Suggestions.save(changed);
        expect(await findOneSuggestion({ _id: original._id })).toMatchObject({
          ...changed,
          state: 'Processing',
        });
      });
    });
  });

  describe('updateStates()', () => {
    it.each(stateUpdateCases)(
      'should mark $state in state if $reason',
      async ({ state, suggestionQuery }) => {
        const original = await findOneSuggestion(suggestionQuery);
        const idQuery = { _id: original._id };
        await Suggestions.updateStates(idQuery);
        const changed = await findOneSuggestion(idQuery);
        expect(changed).toMatchObject({
          ...original,
          state: SuggestionState[state],
        });
      }
    );
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
          state: SuggestionState[state],
        });
      }

      expect(await findOneSuggestion({ entityId: newErroringSuggestion.entityId })).toMatchObject({
        ...newErroringSuggestion,
        state: SuggestionState.error,
      });
      expect(await findOneSuggestion({ entityId: newProcessingSuggestion.entityId })).toMatchObject(
        {
          ...newProcessingSuggestion,
          state: SuggestionState.processing,
        }
      );
    });
  });
});
