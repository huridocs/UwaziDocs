import { browserHistory } from 'react-router';

import { isClient } from 'app/utils';
import { notify } from 'app/Notifications/actions/notificationsActions';
import { store } from 'app/store';
import loadingBar from 'app/App/LoadingProgressBar';

import { APIURL } from '../config.js';
import request from '../../shared/JSONRequest';

let API_URL = APIURL;
let language;

const doneLoading = (data) => {
  loadingBar.done();
  return data;
};

const handleErrorStatus = (error) => {
  if (error.status === 401) {
    browserHistory.replace('/login');
  }

  if (error.status === 404) {
    browserHistory.replace('/404');
  }

  if (error.status === 500) {
    store.dispatch(notify('An error has occurred', 'danger'));
  }

  if (error.status && ![500, 404, 401].includes(error.status)) {
    store.dispatch(notify(error.json.error, 'danger'));
  }

  if (/failed to fetch/i.test(error.message)) {
    store.dispatch(notify('Could not reach server. Please try again later.', 'danger'));
  }
};

const handleError = (e, endpoint) => {
  const error = e;
  error.endpoint = endpoint;

  if (!isClient) {
    return Promise.reject(error);
  }

  doneLoading();

  handleErrorStatus(error);

  return Promise.reject(error);
};

const _request = (url, req, method) => {
  loadingBar.start();
  return request[method](API_URL + url, req.data, {
    'Content-Language': language,
    ...req.headers,
    'X-Requested-With': 'XMLHttpRequest'
  })
  .then(doneLoading)
  .catch(e => handleError(e, { url, method }));
};

export default {
  get: (url, req = {}) => _request(url, req, 'get'),

  post: (url, req = {}) => _request(url, req, 'post'),

  delete: (url, req = {}) => _request(url, req, 'delete'),

  cookie(c) {
    request.cookie(c);
  },

  locale(locale) {
    language = locale;
  },

  APIURL(url) {
    API_URL = url;
  }
};
