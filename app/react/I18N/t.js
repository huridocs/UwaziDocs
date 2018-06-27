import { store } from 'app/store';
import React from 'react';
import { Translate } from './';

const testingEnvironment = process.env.NODE_ENV === 'test';
const t = (contextId, key, _text, returnComponent = true) => {
  if (returnComponent && !testingEnvironment) {
    return (<Translate context={contextId}>{key}</Translate>);
  }
  const text = _text || key;

  if (!t.translation) {
    const state = store.getState();
    const translations = state.translations.toJS();
    t.translation = translations.find(d => d.locale === state.locale) || { contexts: [] };
  }

  const context = t.translation.contexts.find(ctx => ctx.id === contextId) || { values: {} };

  return context.values[key] || text;
};

t.resetCachedTranslation = () => {
  t.translation = null;
};


export default t;
