import franc from 'franc';
import { LanguageCode, LanguageMapper } from 'shared/language';

const detectLanguage = (text: string, purpose: LanguageCode = 'elastic') =>
  LanguageMapper.fromTo(franc(text), 'ISO639_3', purpose);

export { detectLanguage };
