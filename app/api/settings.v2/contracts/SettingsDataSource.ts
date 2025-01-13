import { LanguageISO6391 } from 'shared/types/commonTypes';
import { Settings } from 'shared/types/settingsType';

export interface SettingsDataSource {
  getLanguageKeys(): Promise<LanguageISO6391[]>;
  getDefaultLanguageKey(): Promise<LanguageISO6391>;
  readNewRelationshipsAllowed(): Promise<boolean>;
  readSettings(): Promise<Settings | null>;
}
