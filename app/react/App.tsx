import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'jotai';
import { Provider as ReduxProvider } from 'react-redux';
import { getRoutes } from './Routes';
import CustomProvider from './App/Provider';
import {
  settingsAtom,
  templatesAtom,
  translationsAtom,
  thesaurisAtom,
  atomStore,
} from './V2/atoms';
import { relationshipTypesAtom } from './V2/atoms/relationshipTypes';
import { ErrorBoundary } from './V2/Components/ErrorHandling';
import { store } from './store';

const reduxState = store?.getState();

const settings = reduxState?.settings.collection.toJS() || {};
const templates = reduxState?.templates.toJS() || [];
const thesauris = reduxState?.thesauris.toJS() || [];

const router = createBrowserRouter(getRoutes(settings, reduxState?.user.get('_id')));

atomStore.set(settingsAtom, settings);
atomStore.set(templatesAtom, templates);
atomStore.set(thesaurisAtom, thesauris);
atomStore.set(translationsAtom, { locale: reduxState?.locale || 'en' });

//sync deprecated redux store
atomStore.sub(settingsAtom, () => {
  const value = atomStore.get(settingsAtom);
  store?.dispatch({ type: 'settings/collection/SET', value });
});
atomStore.sub(templatesAtom, () => {
  const value = atomStore.get(templatesAtom);
  store?.dispatch({ type: 'templates/SET', value });
});
atomStore.sub(relationshipTypesAtom, () => {
  const value = atomStore.get(relationshipTypesAtom);
  store?.dispatch({ type: 'relationTypes/SET', value });
});

const App = () => (
  <ReduxProvider store={store as any}>
    <CustomProvider>
      <Provider store={atomStore}>
        <ErrorBoundary>
          <RouterProvider router={router} fallbackElement={null} />
        </ErrorBoundary>
      </Provider>
    </CustomProvider>
  </ReduxProvider>
);

export { App };
