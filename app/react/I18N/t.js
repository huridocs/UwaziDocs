import { atomStore, translationsAtom, localeAtom } from 'V2/atoms';
import React from 'react';
import translate, { getLocaleTranslation, getContext } from '../../shared/translate';
import { Translate } from '.';

const testingEnvironment = process.env.NODE_ENV === 'test';

// eslint-disable-next-line max-statements
const t = (contextId, key, _text, returnComponent = true) => {
  if (!contextId) {
    // eslint-disable-next-line no-console
    console.warn(`You cannot translate "${key}", because context id is "${contextId}"`);
  }

  if (returnComponent && !testingEnvironment) {
    return <Translate context={contextId}>{key}</Translate>;
  }

  let translations;
  let locale;

  const updateTranslations = () => {
    translations = atomStore.get(translationsAtom);
    locale = atomStore.get(localeAtom);
    t.translation = getLocaleTranslation(translations, locale);
    return { translations, locale };
  };

  const text = _text || key;

  updateTranslations();

  atomStore.sub(translationsAtom, () => {
    updateTranslations();
  });

  const context = getContext(t.translation, contextId);

  return translate(context, key, text);
};

export default t;
