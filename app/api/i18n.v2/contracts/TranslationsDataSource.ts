import { ResultSet } from 'api/common.v2/contracts/ResultSet';
import { DeleteResult, UpdateResult } from 'mongodb';
import { Translation, TranslationContext } from '../model/Translation';

export interface TranslationsDataSource {
  insert(translations: Translation[]): Promise<Translation[]>;
  upsert(translations: Translation[]): Promise<Translation[]>;

  getAll(): ResultSet<Translation>;
  getByLanguage(language: string): ResultSet<Translation>;
  getByContext(context: string): ResultSet<Translation>;
  getContext(contextId: string): Promise<TranslationContext>;

  deleteByContextId(contextId: string): Promise<DeleteResult>;
  deleteByLanguage(language: string): Promise<DeleteResult>;
  deleteKeysByContext(contextId: string, keysToDelete: string[]): Promise<DeleteResult>;

  updateContextLabel(contextId: string, contextLabel: string): Promise<UpdateResult<Translation>>;
  updateKeysByContext(contextId: string, keyChanges: { [k: string]: string }): Promise<void>;

  updateValue(key: string, contextId: string, language: string, value: string): Promise<void>;

  calculateUnexistentKeys(keys: string[]): Promise<string[]>;

  calculateKeysWithoutAllLanguages(
    translations: Translation[]
  ): Promise<{ key: string; contextId: string; missingLanguages: string[] }[]>;
}
