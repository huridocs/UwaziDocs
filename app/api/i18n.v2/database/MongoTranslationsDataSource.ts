import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { MongoResultSet } from 'api/common.v2/database/MongoResultSet';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { DuplicatedKeyError } from 'api/common.v2/errors/DuplicatedKeyError';
import { MongoSettingsDataSource } from 'api/settings.v2/database/MongoSettingsDataSource';
import { Db, MongoBulkWriteError } from 'mongodb';
import { objectIndex, objectIndexToArrays } from 'shared/data_utils/objectIndex';
import { LanguageISO6391 } from 'shared/types/commonTypes';
import { TranslationsDataSource } from '../contracts/TranslationsDataSource';
import { TranslationMappers } from '../database/TranslationMappers';
import { ContextDoesNotExist } from '../errors/translationErrors';
import { Translation } from '../model/Translation';
import { TranslationDBO } from '../schemas/TranslationDBO';

const languagesForKeyContext = (
  translations: Translation[]
): { key: string; contextId: string; missingLanguages: LanguageISO6391[] }[] =>
  Object.values(
    translations.reduce<
      Record<string, { key: string; contextId: string; missingLanguages: LanguageISO6391[] }>
    >((result, item) => {
      const key = `${item.key}${item.context.id}`;
      if (!result[key]) {
        // eslint-disable-next-line no-param-reassign
        result[key] = {
          key: item.key,
          contextId: item.context.id,
          missingLanguages: [],
        };
      }
      result[key].missingLanguages.push(item.language);
      return result;
    }, {})
  );

export class MongoTranslationsDataSource
  extends MongoDataSource<TranslationDBO>
  implements TranslationsDataSource
{
  private settingsDS: MongoSettingsDataSource;

  constructor(
    db: Db,
    settingsDS: MongoSettingsDataSource,
    transactionManager: MongoTransactionManager
  ) {
    super(db, transactionManager);
    this.settingsDS = settingsDS;
  }

  protected collectionName = 'translations_v2';

  async insert(translations: Translation[]): Promise<Translation[]> {
    const items = translations.map(translation => TranslationMappers.toDBO(translation));
    try {
      await this.getCollection().insertMany(items, { session: this.getSession() });
    } catch (e) {
      if (e instanceof MongoBulkWriteError && e.message.match('E11000')) {
        throw new DuplicatedKeyError(e.message);
      }
      throw e;
    }
    return translations;
  }

  async upsert(translations: Translation[]): Promise<Translation[]> {
    const items = translations.map(translation => TranslationMappers.toDBO(translation));
    const stream = this.createBulkStream();

    await Promise.all(
      items.map(async item =>
        stream.updateOne(
          { language: item.language, key: item.key, 'context.id': item.context.id },
          { $set: item },
          true
        )
      )
    );
    await stream.flush();

    return translations;
  }

  async deleteByContextId(contextId: string) {
    return this.getCollection().deleteMany(
      { 'context.id': contextId },
      { session: this.getSession() }
    );
  }

  async deleteByLanguage(language: LanguageISO6391) {
    return this.getCollection().deleteMany({ language }, { session: this.getSession() });
  }

  getAll() {
    return new MongoResultSet<TranslationDBO, Translation>(
      this.getCollection().find({}, { session: this.getSession() }),
      TranslationMappers.toModel
    );
  }

  getByLanguage(language: LanguageISO6391) {
    return new MongoResultSet<TranslationDBO, Translation>(
      this.getCollection().find({ language }, { session: this.getSession() }),
      TranslationMappers.toModel
    );
  }

  async getContext(contextId: string) {
    const translation = await this.getCollection().findOne(
      { 'context.id': contextId },
      { session: this.getSession() }
    );
    if (!translation) {
      throw new ContextDoesNotExist(contextId);
    }
    return translation.context;
  }

  getByContext(context: string) {
    return new MongoResultSet<TranslationDBO, Translation>(
      this.getCollection().find({ 'context.id': context }, { session: this.getSession() }),
      TranslationMappers.toModel
    );
  }

  async updateContextLabel(contextId: string, contextLabel: string) {
    return this.getCollection().updateMany(
      { 'context.id': contextId },
      { $set: { 'context.label': contextLabel } },
      { session: this.getSession() }
    );
  }

  async updateKeysByContext(contextId: string, keyChanges: { [k: string]: string }) {
    const stream = this.createBulkStream();

    await Object.entries(keyChanges).reduce(async (previous, [keyName, newKeyName]) => {
      await previous;
      await stream.updateMany(
        { 'context.id': contextId, key: keyName },
        { $set: { key: newKeyName } }
      );
    }, Promise.resolve());
    await stream.flush();
  }

  async updateValue(key: string, contextId: string, language: LanguageISO6391, value: string) {
    await this.getCollection().updateOne(
      { key, 'context.id': contextId, language },
      { $set: { value } },
      { session: this.getSession() }
    );
  }

  async deleteKeysByContext(contextId: string, keysToDelete: string[]) {
    return this.getCollection().deleteMany(
      { 'context.id': contextId, key: { $in: keysToDelete } },
      { session: this.getSession() }
    );
  }

  async calculateUnexistentKeys(keys: string[]) {
    const result = this.getCollection().aggregate(
      [
        { $match: { key: { $in: keys } } },
        { $group: { _id: null, foundKeys: { $push: '$key' } } },
        { $project: { notFoundKeys: { $setDifference: [keys, '$foundKeys'] } } },
      ],
      { session: this.getSession() }
    );
    const [{ notFoundKeys }] = await result.toArray();
    return notFoundKeys || [];
  }

  async calculateKeysWithoutAllLanguages(translations: Translation[]) {
    const configuredLanguageKeys = await this.settingsDS.getLanguageKeys();
    const translationsWithMissingLanguages = languagesForKeyContext(translations);

    const translationsByContext = objectIndexToArrays(
      translationsWithMissingLanguages,
      t => t.contextId,
      t => t
    );

    await Object.entries(translationsByContext).reduce(
      async (previous, [contextId, contextTranslations]) => {
        await previous;
        const dbTranslations = this.getCollection().find(
          {
            key: { $in: contextTranslations.map(t => t.key) },
            'context.id': contextId,
          },
          { session: this.getSession() }
        );

        const translationsByKey = objectIndex(
          contextTranslations,
          t => t.key,
          t => t
        );

        // eslint-disable-next-line no-await-in-loop
        while (await dbTranslations.hasNext()) {
          // eslint-disable-next-line no-await-in-loop
          const dbt = await dbTranslations.next();
          if (dbt) {
            translationsByKey[dbt.key].missingLanguages.push(dbt.language);
          }
        }
      },
      Promise.resolve()
    );

    return translationsWithMissingLanguages.reduce((memo, t) => {
      const set = new Set(configuredLanguageKeys);
      t.missingLanguages.forEach(key => {
        set.delete(key);
      });
      if (set.size) {
        // eslint-disable-next-line no-param-reassign
        t.missingLanguages = Array.from(set);
        memo.push(t);
      }
      return memo;
    }, [] as { key: string; contextId: string; missingLanguages: string[] }[]);
  }
}
