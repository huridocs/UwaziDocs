import request from '../../shared/JSONRequest';
import { isClient } from 'app/utils';
import { APIURL } from '../config.js';
import { browserHistory } from 'react-router';
import { notify } from 'app/Notifications/actions/notificationsActions';
import { store } from 'app/store';
import loadingBar from 'app/App/LoadingProgressBar';

let cookie;
let locale;
let API_URL = APIURL;

const doneLoading = (data) => {
  loadingBar.done();
  return data;
};

const handleError = (url, method, error) => {
  if (!isClient) {
    return Promise.reject(error);
  }

  doneLoading();

  if (error.status === 401) {
    browserHistory.replace('/login');
    return Promise.reject(error);
  }

  if (error.status === 404) {
    browserHistory.replace('/404');
    return Promise.reject(error);
  }

  if (error.status === 500) {
    store.dispatch(notify('An error has occurred', 'danger'));
    return Promise.reject(error);
  }

  console.log(`API error without status code when calling to ${method} ${API_URL}${url}`);
  store.dispatch(notify(error.json.error, 'danger'));
  return Promise.reject(error);
};

export default {
  get: (url, data) => {
    loadingBar.start();
    return request.get(API_URL + url, data, { 'Content-language': locale, Cookie: cookie })
    .then(doneLoading)
    .catch(handleError.bind(null, url, 'GET'));
  },

  post: (url, data) => {
    loadingBar.start();
    return request.post(API_URL + url, data, { 'Content-language': locale })
    .then(doneLoading)
    .catch(handleError.bind(null, url, 'POST'));
  },

  delete: (url, data) => {
    loadingBar.start();
    return request.delete(API_URL + url, data, { 'Content-language': locale })
    .then(doneLoading)
    .catch(handleError.bind(null, url, 'DELETE'));
  },

  cookie(c) {
    cookie = c;
  },

  locale(key) {
    locale = key;
  },

  APIURL(url) {
    API_URL = url;
  }
};
