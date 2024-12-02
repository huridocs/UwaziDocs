import { LanguageMapper, availableLanguages } from 'shared/languagesList';

export default ({ language }) => {
  const languageKey = LanguageMapper.fromTo(language, 'ISO639_3', 'ISO639_1');
  const laguageData = availableLanguages.find(l => l.key === languageKey) || {};
  return `force-${laguageData.rtl ? 'rtl' : 'ltr'}`;
};
