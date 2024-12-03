import { detectLanguage } from 'shared/detectLanguage';
import { availableLanguages, LanguageMapper } from 'shared/languagesList';

describe('languages', () => {
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
      expect(detectLanguage('de que color es el caballo blanco de santiago', 'ISO639_3')).toBe(
        'spa'
      );
      expect(detectLanguage('what is the colour of the white horse of santiago', 'ISO639_3')).toBe(
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
