import { combineReducers } from 'redux';
import createReducer from 'app/BasicReducer';

import template from 'app/Templates/reducers/reducer';
import page from 'app/Pages/reducers/reducer';
import { reducer as notificationsReducer } from 'app/Notifications';

import thesauri from 'app/Thesauris/reducers/reducer';
import documentViewer from 'app/Viewer/reducers/reducer';
import entityView from 'app/Entities/reducers/reducer';
import contextMenu from 'app/ContextMenu/reducers/contextMenuReducer';
import { reducer as connections } from 'app/Connections';
import relationships from 'app/Relationships';
import ConnectionsList from 'app/ConnectionsList/reducers/reducer';
import { reducer as attachments } from 'app/Attachments';

import library from 'app/Library/reducers/reducer';
import modals from 'app/Modals/reducers/modalsReducer';
import progress from 'app/Uploads/reducers/progressReducer';
import user from 'app/Auth/reducer';
import settings from 'app/Settings/reducers/reducer';
import login from 'app/Users/reducers/login';
import metadata from 'app/Metadata/reducer';
import locale from 'app/I18N/reducer';
import inlineEdit from 'app/I18N/inlineEditReducer';

import { modelReducer, formReducer } from 'react-redux-form';

export default combineReducers({
  notifications: notificationsReducer,
  library: library('library'),
  uploads: library('uploads'),
  progress,
  locale,
  inlineEdit,
  inlineEditForm: formReducer('inlineEditModel', {}),
  inlineEditModel: modelReducer('inlineEditModel', {}),
  template,
  page,
  thesauri,
  entityView,
  thesauris: createReducer('thesauris', []),
  dictionaries: createReducer('dictionaries', []),
  relationTypes: createReducer('relationTypes', []),
  relationType: modelReducer('relationType', { name: '' }),
  relationTypeForm: formReducer('relationType', { name: '' }),
  templates: createReducer('templates', []),
  translations: createReducer('translations', []),
  translationsForm: modelReducer('translationsForm', []),
  translationsFormState: formReducer('translationsForm'),
  pages: createReducer('pages', []),
  users: createReducer('users', []),
  documentViewer,
  contextMenu,
  connections,
  connectionsList: ConnectionsList,
  relationships: relationships.reducer,
  attachments,
  modals,
  user,
  login,
  settings,
  metadata,
  searchForm: formReducer('search')
});
