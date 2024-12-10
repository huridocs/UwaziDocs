import { availableLanguages, LanguageCode, otherLanguageSchema } from './availableLanguages';

export class LanguageMapper {
  private static getByCode(code: string, languageCode: LanguageCode) {
    return availableLanguages.find(item => code === item[languageCode]);
  }

  static fromTo(code: string, from: LanguageCode, to: LanguageCode) {
    const schema = this.getByCode(code, from);
    const defaultValue = to !== 'ISO639_1' ? otherLanguageSchema[to] : null;

    return schema?.[to] || defaultValue;
  }
}
