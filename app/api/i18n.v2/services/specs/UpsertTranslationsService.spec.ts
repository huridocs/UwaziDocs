import { getClient, getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { LanguageDoesNotExist } from 'api/i18n.v2/errors/translationErrors';
import { MongoSettingsDataSource } from 'api/settings.v2/database/MongoSettingsDataSource';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import testingDB from 'api/utils/testing_db';
import { MongoTranslationsDataSource } from '../../database/MongoTranslationsDataSource';
import { CreateTranslationsData } from '../CreateTranslationsService';
import { UpsertTranslationsService } from '../UpsertTranslationsService';

const collectionInDb = (collection = 'translations_v2') =>
  testingDB.mongodb?.collection(collection)!;

const createService = () =>
  new UpsertTranslationsService(
    new MongoTranslationsDataSource(
      getConnection(),
      new MongoSettingsDataSource(getConnection(), new MongoTransactionManager(getClient())),
      new MongoTransactionManager(getClient())
    ),
    new MongoSettingsDataSource(getConnection(), new MongoTransactionManager(getClient())),
    new MongoTransactionManager(getClient())
  );

const translation = (translationData: Partial<CreateTranslationsData>): CreateTranslationsData => ({
  language: 'es',
  key: 'key',
  value: 'valor',
  context: { type: 'Entity', label: 'Test', id: 'test' },
  ...translationData,
});

const fixtures = {
  translations_v2: [
    {
      language: 'es',
      key: 'key',
      value: 'valor',
      context: { type: 'Entity', label: 'Test', id: 'test' },
    },
    {
      language: 'en',
      key: 'key',
      value: 'value',
      context: { type: 'Entity', label: 'Test', id: 'test' },
    },
  ],
  settings: [
    {
      languages: [
        { default: true, label: 'English', key: 'en' },
        { label: 'Spanish', key: 'es' },
      ],
    },
  ],
};

beforeEach(async () => {
  await testingEnvironment.setUp(fixtures);
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

describe('CreateTranslationsService', () => {
  describe('upsert()', () => {
    it('should persist new translations and update existing ones', async () => {
      await createService().upsert([
        translation({ language: 'en', key: 'key', value: 'updatedValue' }),
        translation({ language: 'es', key: 'new key', value: 'valor nuevo' }),
        translation({ language: 'en', key: 'new key', value: 'new value' }),
      ]);

      const translationsInDb = await collectionInDb().find({}).sort({ key: 1 }).toArray();

      expect(translationsInDb).toMatchObject([
        translation({ language: 'es', key: 'key', value: 'valor' }),
        translation({ language: 'en', key: 'key', value: 'updatedValue' }),
        translation({ language: 'es', key: 'new key', value: 'valor nuevo' }),
        translation({ language: 'en', key: 'new key', value: 'new value' }),
      ]);
    });

    it('should return persisted translations', async () => {
      const translations: CreateTranslationsData[] = [
        translation({ language: 'en', key: 'key', value: 'updatedValue' }),
        translation({ language: 'es', key: 'new key', value: 'valor nuevo' }),
        translation({ language: 'en', key: 'new key', value: 'new value' }),
      ];
      const createdTranslations = await createService().upsert(translations);

      expect(createdTranslations).toEqual(translations);
    });

    describe('when language does not exists as a configured language in settings', () => {
      it('should throw a validation error', async () => {
        const service = createService();
        await expect(
          service.upsert([
            translation({ language: 'does not exist' }),
            translation({ language: 'es' }),
            translation({ language: 'no' }),
          ])
        ).rejects.toEqual(new LanguageDoesNotExist('["does not exist","no"]'));
      });
    });
  });
});
