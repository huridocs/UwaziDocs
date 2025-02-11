import { Suggestions } from 'api/suggestions/suggestions';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { toHaveBeenCalledBefore } from 'jest-extended';
import { ModelStatus } from 'shared/types/IXModelSchema';
import ixmodels from '../ixmodels';

expect.extend({ toHaveBeenCalledBefore });

const fixtureFactory = getFixturesFactory();

describe('save()', () => {
  beforeAll(async () => {
    await testingEnvironment.setUp({
      settings: [{ languages: [{ default: true, label: 'English', key: 'en' }] }],
    });
  });

  afterAll(async () => {
    await testingEnvironment.tearDown();
  });

  it('should set suggestions obsolete on saving a ready model', async () => {
    const setSpy = jest.spyOn(Suggestions, 'setObsolete');

    await ixmodels.save({
      extractorId: fixtureFactory.id('extractor'),
      creationDate: 5,
      status: ModelStatus.processing,
    });

    expect(setSpy).not.toHaveBeenCalled();

    await ixmodels.save({
      extractorId: fixtureFactory.id('extractor'),
      creationDate: 5,
      status: ModelStatus.ready,
    });

    expect(setSpy).toHaveBeenCalledWith({ extractorId: fixtureFactory.id('extractor') });

    setSpy.mockRestore();
  });

  it('should call markSuggestionsWithoutSegmentation on saving a ready model', async () => {
    const setSpySetObsolete = jest.spyOn(Suggestions, 'setObsolete');
    const setSpyMarkSuggestions = jest.spyOn(Suggestions, 'markSuggestionsWithoutSegmentation');

    await ixmodels.save({
      extractorId: fixtureFactory.id('extractor'),
      creationDate: 5,
      status: ModelStatus.processing,
    });

    expect(setSpyMarkSuggestions).not.toHaveBeenCalled();

    await ixmodels.save({
      extractorId: fixtureFactory.id('extractor'),
      creationDate: 5,
      status: ModelStatus.ready,
    });

    expect(setSpySetObsolete).toHaveBeenCalledWith({ extractorId: fixtureFactory.id('extractor') });
    expect(setSpyMarkSuggestions).toHaveBeenCalledWith({
      extractorId: fixtureFactory.id('extractor'),
    });
    expect(setSpySetObsolete).toHaveBeenCalledBefore(setSpyMarkSuggestions);
    setSpySetObsolete.mockRestore();
    setSpyMarkSuggestions.mockRestore();
  });
});
