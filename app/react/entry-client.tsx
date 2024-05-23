import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './App/sockets';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import type { RequestError } from 'V2/shared/errorUtils';
import { App } from './App';

declare global {
  interface Window {
    __loadingError__?: RequestError;
  }
}

if (window.SENTRY_APP_DSN) {
  Sentry.init({
    release: window.UWAZI_VERSION,
    environment: window.UWAZI_ENVIRONMENT,
    dsn: window.SENTRY_APP_DSN,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay(),
    ],

    tracesSampleRate: 0.1,
  });
}

const container = document.getElementById('root');
const root = window.__loadingError__ === undefined ? hydrateRoot(container!, <App />) : container;

export { root };
