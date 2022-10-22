export interface SettingsDataSource {
  getLanguageKeys(): Promise<string[]>;
  getDefaultLanguageKey(): Promise<string>;
}
