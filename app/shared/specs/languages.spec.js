import languages from '../languages';
import { detectLanguage } from '../detectLanguage';
import { availableLanguages, LanguageMapper } from 'shared/languagesList';

describe('languages', () => {
  describe('getAll', () => {
    it('should return a list of all languages for the default purpose', () => {
      expect(languages.getAll().length).toBe(32);
      expect(languages.getAll()[0]).toBe('arabic');
    });

    it('should return a list of all languages for the passed purpose', () => {
      expect(languages.getAll('ISO639_1').length).toBe(31);
      expect(languages.getAll('franc').length).toBe(33);

      expect(languages.getAll('ISO639_1')[5]).toBe(languages.data[6].ISO639_1);
      expect(languages.getAll('franc')[5]).toBe(languages.data[5].franc);
    });
  });

  describe('get', () => {
    it('should return a match for the key for the default purpose', () => {
      expect(languages.get('glg')).toBe('galician');
      expect(languages.get('lav')).toBe('latvian');
    });

    it('should return a match for the key for the passed purpose', () => {
      expect(languages.get('glg', 'ISO639_1')).toBe('gl');
      expect(languages.get('lav', 'ISO639_1')).toBe('lv');
    });

    it('should return other for a key in a non supported lang', () => {
      expect(languages.get('und')).toBe('other');
    });

    it('should return null for a key in a non supported lang when asking for ISO639_1', () => {
      expect(languages.get('und', 'ISO639_1')).toBe(null);
    });
  });

  describe('detectLanguage', () => {
    it('should return the text language (for elasticsearch by default)', () => {
      expect(detectLanguage('de que color es el caballo blanco de santiago')).toBe('spanish');
      expect(detectLanguage('what is the colour of the white horse of santiago')).toBe('english');
    });

    it('should return the text language for a specific purpose if selected', () => {
      expect(detectLanguage('de que color es el caballo blanco de santiago', 'ISO639_1')).toBe(
        'es'
      );
      expect(detectLanguage('what is the colour of the white horse of santiago', 'ISO639_1')).toBe(
        'en'
      );
      expect(detectLanguage('de que color es el caballo blanco de santiago', 'franc')).toBe('spa');
      expect(detectLanguage('what is the colour of the white horse of santiago', 'franc')).toBe(
        'eng'
      );

      expect(detectLanguage('Це перевірка', 'ISO639_3')).toBe('ukr');
    });

    it('should return other when the language is not supported', () => {
      expect(detectLanguage('color chIS Sargh santiago')).toBe('other');
      expect(detectLanguage('sdgfghhg hgjk ljhgfhgjk ghgjh ghfdfgfartytuasd fjh fghjgjasd')).toBe(
        'other'
      );
    });
  });

  describe('Language Mapper', () => {
    test('when given a valid code language, it should translate correctly', () => {
      const englishLanguageSchema = availableLanguages.find(item => item.ISO639_3 === 'eng');

      expect(LanguageMapper.fromTo(englishLanguageSchema.ISO639_1, 'ISO639_1', 'ISO639_3')).toBe(
        englishLanguageSchema.ISO639_3
      );

      expect(LanguageMapper.fromTo(englishLanguageSchema.ISO639_1, 'ISO639_1', 'elastic')).toBe(
        englishLanguageSchema.elastic
      );

      expect(LanguageMapper.fromTo(englishLanguageSchema.ISO639_3, 'ISO639_3', 'ISO639_1')).toBe(
        englishLanguageSchema.ISO639_1
      );

      expect(LanguageMapper.fromTo(englishLanguageSchema.ISO639_3, 'ISO639_3', 'elastic')).toBe(
        englishLanguageSchema.elastic
      );

      expect(LanguageMapper.fromTo(englishLanguageSchema.elastic, 'elastic', 'ISO639_1')).toBe(
        englishLanguageSchema.ISO639_1
      );

      expect(LanguageMapper.fromTo(englishLanguageSchema.elastic, 'elastic', 'ISO639_3')).toBe(
        englishLanguageSchema.ISO639_3
      );
    });

    test('when given a code language that does not have a translation and it is different from "ISO639_1", it should return "other" as default value', () => {
      expect(LanguageMapper.fromTo('any_code_language', 'ISO639_3', 'ISO639_3')).toBe('other');
      expect(LanguageMapper.fromTo('any_code_language', 'ISO639_3', 'elastic')).toBe('other');
    });

    test('when given a code language that does not have a translation and it is equal to "ISO639_1", it should return null as default value', () => {
      expect(LanguageMapper.fromTo('any_code_language', 'ISO639_3', 'ISO639_1')).toBe(null);
    });
  });
});
