import { LanguageSchema } from 'shared/types/commonTypes';
import { LanguageCode, availableLanguages, OTHER_LANGUAGE_SCHEMA } from './available-languages';

class LanguageUtils {
  static getLanguagesByCode(code: LanguageCode = 'elastic'): LanguageSchema[] {
    return availableLanguages.filter(item => Boolean(item[code]));
  }

  private static uniqueValues(array: string[]) {
    return Array.from(new Set(array));
  }

  static getLanguageCodes(languages: LanguageSchema[], languageCode: LanguageCode): string[] {
    return this.uniqueValues(languages.map(item => item[languageCode]) as string[]);
  }

  static getLanguageSchema(ISO639_3: string) {
    return availableLanguages.find(item => item.ISO639_3 === ISO639_3) || OTHER_LANGUAGE_SCHEMA;
  }
}

export { LanguageUtils };
