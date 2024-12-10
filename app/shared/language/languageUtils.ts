import { LanguageSchema } from 'shared/types/commonTypes';
import { LanguageCode, availableLanguages, otherLanguageSchema } from './availableLanguages';

const uniqueValues = (array: string[]) => Array.from(new Set(array));

class LanguageUtils {
  static getByCode(code: LanguageCode = 'elastic'): LanguageSchema[] {
    return availableLanguages.filter(item => Boolean(item[code]));
  }

  static getCodes(languages: LanguageSchema[], languageCode: LanguageCode): string[] {
    return uniqueValues(languages.map(item => item[languageCode]) as string[]);
  }

  static getSchema(ISO639_3: string) {
    return availableLanguages.find(item => item.ISO639_3 === ISO639_3) || otherLanguageSchema;
  }
}

export { LanguageUtils };
