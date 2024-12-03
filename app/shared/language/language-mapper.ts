import { availableLanguages, LanguageCode, OTHER_LANGUAGE_SCHEMA } from './available-languages';

export class LanguageMapper {
  private static getLanguageByCode(code: string, languageCode: LanguageCode) {
    return availableLanguages.find(item => code === item[languageCode]);
  }

  static fromTo(code: string, from: LanguageCode, to: LanguageCode) {
    const schema = this.getLanguageByCode(code, from);
    const defaultValue = to !== 'ISO639_1' ? OTHER_LANGUAGE_SCHEMA[to] : null;

    return schema?.[to] || defaultValue;
  }
}
