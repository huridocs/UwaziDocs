/* eslint-disable max-lines */
import { Request as ExpressRequest, Response } from 'express';
// eslint-disable-next-line node/no-restricted-import
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { matchRoutes, RouteObject } from 'react-router-dom';
import { omit } from 'lodash';
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from 'react-router-dom/server';
import {
  AgnosticDataRouteObject,
  unstable_createStaticHandler as createStaticHandler,
} from '@remix-run/router';
import api from 'app/utils/api';
import { RequestParams } from 'app/utils/RequestParams';
import { Settings } from 'shared/types/settingsType';
import createStore from './store';
import { getRoutes } from './Routes';
import { ClientTranslationSchema, IStore } from './istore';
import { I18NUtils, t, Translate } from './I18N';
import Root from './App/Root';
import CustomProvider from './App/Provider';
import translationsApi from '../api/i18n/translations';
import settingsApi from '../api/settings/settings';
import RouteHandler from './App/RouteHandler';

const onlySystemTranslations = (translations: ClientTranslationSchema[]) => {
  const rows = translations.map(translation => {
    const systemTranslation = translation?.contexts?.find(c => c.id === 'System');
    return { ...translation, contexts: [systemTranslation] };
  });

  return { json: { rows } };
};

const createFetchHeaders = (requestHeaders: ExpressRequest['headers']): Headers => {
  const headers = new Headers();

  Object.entries(requestHeaders).forEach(([key, values]) => {
    if (values) {
      if (Array.isArray(values)) {
        values.forEach(value => headers.append(key, value));
      } else {
        headers.set(key, values);
      }
    }
  });

  return headers;
};

const createFetchRequest = (req: ExpressRequest): Request => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const url = new URL(req.url, origin);

  const controller = new AbortController();

  req.on('close', () => {
    controller.abort();
  });

  const init: RequestInit = {
    method: req.method,
    headers: createFetchHeaders(req.headers),
    signal: controller.signal,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body;
  }

  return new Request(url.href, init);
};

const getAssets = async () => {
  if (process.env.HOT) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/../../dist/webpack-assets.json`, (err, data) => {
      if (err) {
        reject(
          new Error(`${err}\nwebpack-assets.json do not exists or is malformed !,
          \nyou probably need to build webpack with the production configuration`)
        );
      }
      try {
        resolve(JSON.parse(data.toString()));
      } catch (e) {
        reject(e);
      }
    });
  });
};

const prepareStore = async (req: ExpressRequest, settings: Settings, language: string) => {
  const locale = I18NUtils.getLocale(language, settings.languages, req.cookies);

  const headers = {
    'Content-Language': locale,
    Cookie: `connect.sid=${req.cookies['connect.sid']}`,
    tenant: req.get('tenant'),
  };

  const requestParams = new RequestParams({}, headers);

  api.APIURL(`http://localhost:${process.env.PORT || 3000}/api/`);

  const translations = await translationsApi.get();

  const [
    userApiResponse = { json: {} },
    translationsApiResponse = onlySystemTranslations(translations),
    settingsApiResponse = { json: { languages: [], private: settings.private } },
    templatesApiResponse = { json: { rows: [] } },
    thesaurisApiResponse = { json: { rows: [] } },
    relationTypesApiResponse = { json: { rows: [] } },
  ] =
    !settings.private || req.user
      ? await Promise.all([
          api.get('user', requestParams),
          Promise.resolve({ json: { rows: translations } }),
          api.get('settings', requestParams),
          api.get('templates', requestParams),
          api.get('thesauris', requestParams),
          api.get('relationTypes', requestParams),
        ])
      : [];

  const globalResources = {
    user: userApiResponse.json,
    translations: translationsApiResponse.json.rows,
    templates: templatesApiResponse.json.rows,
    thesauris: thesaurisApiResponse.json.rows,
    relationTypes: relationTypesApiResponse.json.rows,
    settings: {
      collection: { ...settingsApiResponse.json, links: settingsApiResponse.json.links || [] },
    },
  };

  const reduxStore = createStore({
    ...globalResources,
    locale,
  });

  return { reduxStore };
};

const setReduxState = async (
  req: ExpressRequest,
  reduxState: IStore,
  matched: { route: RouteObject; params: {} }[] | null
) => {
  let routeParams = {};
  const dataLoaders = matched
    ?.map(({ route, params }) => {
      routeParams = { ...routeParams, ...params };
      if (route.element) {
        const component = route.element as React.ReactElement & {
          type: { requestState: Function };
        };
        routeParams = { ...routeParams, ...component.props.params };
        if (component.props.children?.type?.requestState) {
          return component.props.children.type.requestState;
        }
        if (component.type.requestState) {
          return component.type.requestState;
        }
      }
      return null;
    })
    .filter(v => v);
  const initialStore = createStore(reduxState);
  if (dataLoaders && dataLoaders.length > 0) {
    const headers = {
      'Content-Language': reduxState.locale,
      Cookie: `connect.sid=${req.cookies['connect.sid']}`,
      tenant: req.get('tenant'),
    };
    const requestParams = new RequestParams(
      { ...req.query, ...omit(routeParams, 'lang') },
      headers
    );

    await Promise.all(
      dataLoaders.map(async loader => {
        const actions = await loader(requestParams, reduxState);
        if (Array.isArray(actions)) {
          actions.forEach(action => {
            initialStore.dispatch(action);
          });
        }
      })
    );
  }
  return { initialStore, initialState: initialStore.getState() };
};

const getSSRProperties = async (
  req: ExpressRequest,
  routes: RouteObject[],
  settings: Settings,
  language: string
) => {
  const { reduxStore } = await prepareStore(req, settings, language);
  const { query } = createStaticHandler(routes as AgnosticDataRouteObject[]);
  const staticHandleContext = await query(createFetchRequest(req));
  const router = createStaticRouter(routes, staticHandleContext as any);
  const reduxState = reduxStore.getState();

  return {
    reduxState,
    staticHandleContext,
    router,
  };
};

const resetTranslations = () => {
  t.resetCachedTranslation();
  Translate.resetCachedTranslation();
};

const EntryServer = async (req: ExpressRequest, res: Response) => {
  RouteHandler.renderedFromServer = true;
  const [settings, assets] = await Promise.all([settingsApi.get(), getAssets()]);
  const routes = getRoutes(settings, req.user && req.user._id);
  const matched = matchRoutes(routes, req.path);
  const language = matched ? matched[0].params.lang : req.language;

  const { reduxState, staticHandleContext, router } = await getSSRProperties(
    req,
    routes,
    settings,
    language || 'en'
  );

  const { initialStore, initialState } = await setReduxState(req, reduxState, matched);

  resetTranslations();

  const componentHtml = ReactDOMServer.renderToString(
    <Provider store={initialStore as any}>
      <CustomProvider initialData={initialState} user={req.user} language={initialState.locale}>
        <React.StrictMode>
          <StaticRouterProvider
            router={router}
            context={staticHandleContext as any}
            nonce="the-nonce"
          />
        </React.StrictMode>
      </CustomProvider>
    </Provider>
  );

  const html = ReactDOMServer.renderToString(
    <Root
      language={initialState.locale}
      content={componentHtml}
      head={Helmet.rewind()}
      user={req.user}
      reduxData={initialState}
      assets={assets}
    />
  );

  res.send(`<!DOCTYPE html>${html}`);
};

export { EntryServer };
