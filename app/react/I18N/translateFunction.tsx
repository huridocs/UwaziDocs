import React from 'react';
import { atomStore, translationsAtom, localeAtom } from 'V2/atoms';
import translate, { getLocaleTranslation, getContext } from 'shared/translate';
import { Translate } from './Translate';

//return type as any since there is no way to create conditional returns based on parameters
interface TranslationFunction {
  (contextId?: string, key?: string, text?: string | null, returnComponent?: boolean): any;
  translation?: string;
}

const t: TranslationFunction = (contextId, key, text, returnComponent = true) => {
  let translations;
  let locale;

  if (!contextId) {
    // eslint-disable-next-line no-console
    console.warn(`You cannot translate "${key}", because context id is "${contextId}"`);
  }

  if (returnComponent) {
    return <Translate context={contextId}>{key}</Translate>;
  }

  const updateTranslations = () => {
    translations = atomStore.get(translationsAtom);
    locale = atomStore.get(localeAtom);
    t.translation = getLocaleTranslation(translations, locale);
    return { translations, locale };
  };

  updateTranslations();

  atomStore.sub(translationsAtom, () => {
    updateTranslations();
  });

  const context = getContext(t.translation, contextId);

  return translate(context, key, text || key);
};

export { t };
