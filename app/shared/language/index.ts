import { LanguageUtils } from './language-utils';
import { LanguageMapper } from './language-mapper';

const ISO6391Languages = LanguageUtils.getLanguagesByCode('ISO639_1');
const ISO6391Codes = LanguageUtils.getLanguageCodes(ISO6391Languages, 'ISO639_1');

const elasticLanguages = LanguageUtils.getLanguagesByCode('elastic');
const elasticLanguageCodes = LanguageUtils.getLanguageCodes(elasticLanguages, 'elastic');

export { elasticLanguages, elasticLanguageCodes, ISO6391Codes, LanguageMapper, LanguageUtils };
export { availableLanguages } from './available-languages';

export type { LanguageCode } from './available-languages';
