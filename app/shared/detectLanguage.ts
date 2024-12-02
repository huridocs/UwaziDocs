import franc from 'franc';
import { language, LanguageCode } from 'shared/languagesList';

const detectLanguage = (text: string, purpose: LanguageCode = 'elastic') =>
  language(franc(text), purpose);
export { detectLanguage };
