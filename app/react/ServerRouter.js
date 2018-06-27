import { fromJS as Immutable } from 'immutable';
import { Provider } from 'react-redux';
import { match, RouterContext } from 'react-router';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';
import React from 'react';

import { I18NUtils } from 'app/I18N';
import JSONUtils from 'shared/JSONUtils';
import RouteHandler from 'app/App/RouteHandler';
import api from 'app/utils/api';
import fs from 'fs';
import { t, Translate } from 'app/I18N';

import { getPropsFromRoute } from './utils';
import CustomProvider from './App/Provider';
import NoMatch from './App/NoMatch';
import Root from './App/Root';
import Routes from './Routes';
import settingsApi from '../api/settings/settings';
import store from './store';
import translationsApi from '../api/i18n/translations';

let assets = {};

function renderComponentWithRoot(Component, componentProps, initialData, user, isRedux = false) {
  let initialStore = store({});

  if (isRedux) {
    initialStore = store(initialData);
  }
  // to prevent warnings on some client libs that use window global var
  global.window = {};
  //
  t.resetCachedTranslation();
  Translate.resetCachedTranslation();
  const componentHtml = renderToString(
    <Provider store={initialStore}>
      <CustomProvider initialData={initialData} user={user}>
        <Component {...componentProps} />
      </CustomProvider>
    </Provider>
  );

  const head = Helmet.rewind();

  let reduxData = {};
  let data = initialData;

  if (isRedux) {
    reduxData = initialData;
    data = {};
  }

  return `<!doctype html>\n${renderToString(
    <Root content={componentHtml} initialData={data} head={head} user={user} reduxData={reduxData} assets={assets}/>
  )}`;
}

function handle404(res) {
  const wholeHtml = renderComponentWithRoot(NoMatch);
  res.status(404).send(wholeHtml);
}

function handleError(res, error) {
  res.status(500).send(error.message);
}

function handleRedirect(res, redirectLocation) {
  res.redirect(302, redirectLocation.pathname + redirectLocation.search);
}

function onlySystemTranslations(AllTranslations) {
  const rows = AllTranslations.map((translation) => {
    const systemTranslation = translation.contexts.find(c => c.id === 'System');
    translation.contexts = [systemTranslation];
    return translation;
  });

  return { json: { rows } };
}

function handleRoute(res, renderProps, req) {
  const routeProps = getPropsFromRoute(renderProps, ['requestState']);

  function renderPage(initialData, isRedux) {
    const wholeHtml = renderComponentWithRoot(RouterContext, renderProps, initialData, req.user, isRedux);
    res.status(200).send(wholeHtml);
  }

  if (routeProps.requestState) {
    if (req.cookies) {
      api.cookie(`connect.sid=${req.cookies['connect.sid']}`);
    }

    RouteHandler.renderedFromServer = true;
    let query;
    if (renderProps.location && Object.keys(renderProps.location.query).length > 0) {
      query = JSONUtils.parseNested(renderProps.location.query);
    }

    let locale;
    return settingsApi.get()
    .then((settings) => {
      const { languages } = settings;
      const path = req.url;
      locale = I18NUtils.getLocale(path, languages, req.cookies);
      api.locale(locale);

      return settings;
    })
    .then((settingsData) => {
      if (settingsData.private && !req.user) {
        return Promise.all([
          Promise.resolve({ json: {} }),
          Promise.resolve({ json: { languages: [], private: settingsData.private } }),
          translationsApi.get().then(onlySystemTranslations),
          Promise.resolve({ json: { rows: [] } }),
          Promise.resolve({ json: { rows: [] } })
        ]);
      }

      return Promise.all([
        api.get('user'),
        api.get('settings'),
        api.get('translations'),
        api.get('templates'),
        api.get('thesauris')
      ]);
    })
    .then(([user, settings, translations, templates, thesauris]) => {
      const globalResources = {
        user: user.json,
        settings: { collection: settings.json },
        translations: translations.json.rows,
        templates: templates.json.rows,
        thesauris: thesauris.json.rows
      };

      globalResources.settings.collection.links = globalResources.settings.collection.links || [];

      return Promise.all([routeProps.requestState(renderProps.params, query, {
        templates: Immutable(globalResources.templates),
        thesauris: Immutable(globalResources.thesauris)
      }), globalResources]);
    })
    .catch((error) => {
      if (error.status === 401) {
        res.redirect(302, '/login');
        return Promise.reject(error);
      }

      if (error.status === 404) {
        res.redirect(302, '/404');
        return Promise.reject(error);
      }

      if (error.status === 500) {
        handleError(res, error);
        return Promise.reject(error);
      }

      return Promise.reject(error);
    })
    .then(([initialData, globalResources]) => {
      initialData.user = globalResources.user;
      initialData.settings = globalResources.settings;
      initialData.translations = globalResources.translations;
      initialData.templates = globalResources.templates;
      initialData.thesauris = globalResources.thesauris;
      initialData.locale = locale;
      renderPage(initialData, true);
    })
    .catch((e) => {
      let error = e;
      // console.trace(error); // eslint-disable-line
      if (error instanceof Error) {
        error = error.stack.split('\n');
      }
      console.log(error);
    });
  }

  renderPage();
}

const allowedRoute = (user = {}, url) => {
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';
  const authRoutes = [
    '/uploads',
    '/settings/account'
  ];

  const adminRoutes = [
    '/settings/users',
    '/settings/collection',
    '/settings/navlink',
    '/settings/pages',
    '/settings/translations',
    '/settings/filters',
    '/settings/documents',
    '/settings/entities',
    '/settings/dictionaries',
    '/settings/connections'
  ];

  const isAdminRoute = adminRoutes.reduce((found, authRoute) => found || url.indexOf(authRoute) !== -1, false);

  const isAuthRoute = authRoutes.reduce((found, authRoute) => found || url.indexOf(authRoute) !== -1, false);

  return isAdminRoute && isAdmin ||
    isAuthRoute && (isAdmin || isEditor) ||
    !isAdminRoute && !isAuthRoute;
};

function routeMatch(req, res, location) {
  match({ routes: Routes, location }, (error, redirectLocation, renderProps) => {
    if (error) {
      return handleError(error);
    } else if (redirectLocation) {
      return handleRedirect(res, redirectLocation);
    } else if (renderProps) {
      return handleRoute(res, renderProps, req);
    }

    return handle404(res);
  });
}

function getAssets() {
  if (process.env.HOT) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/../../dist/webpack-assets.json`, (err, data) => {
      if (err) {
        reject(new Error(`${err}\nwebpack-assets.json do not exists or is malformed !,
                          you probably need to build webpack with the production configuration`));
      }
      try {
        assets = JSON.parse(data);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

function ServerRouter(req, res) {
  if (!allowedRoute(req.user, req.url)) {
    const url = req.user ? '/' : '/login';
    return res.redirect(302, url);
  }

  const { PORT } = process.env;
  api.APIURL(`http://localhost:${PORT || 3000}/api/`);

  let location = req.url;
  if (location === '/') {
    return settingsApi.get()
    .then((settingsData) => {
      if (settingsData.home_page) {
        location = settingsData.home_page;
      }
      return getAssets();
    })
    .then(() => {
      routeMatch(req, res, location);
    });
  }

  getAssets()
  .then(() => {
    routeMatch(req, res, location);
  });
}

export default ServerRouter;
