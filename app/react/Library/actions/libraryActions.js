import qs from 'qs';
import rison from 'rison-node';
import { actions as formActions } from 'react-redux-form';
import { browserHistory } from 'react-router';
import { store } from 'app/store';
import * as types from 'app/Library/actions/actionTypes';
import { actions } from 'app/BasicReducer';
import { documentsApi } from 'app/Documents';
import { api as entitiesAPI } from 'app/Entities';
import { notificationActions } from 'app/Notifications';
import { RequestParams } from 'app/utils/RequestParams';
import searchAPI from 'app/Search/SearchAPI';
import referencesAPI from 'app/Viewer/referencesAPI';
import { toUrlParams } from 'shared/JSONRequest';
import { selectedDocumentsChanged, maybeSaveQuickLabels } from './quickLabelActions';
import { filterToQuery } from '../helpers/publishedStatusFilter';
import { saveEntityWithFiles } from './saveEntityWithFiles';

export function enterLibrary() {
  return { type: types.ENTER_LIBRARY };
}

export function initializeFiltersForm(values = {}) {
  return Object.assign(values, { type: types.INITIALIZE_FILTERS_FORM });
}

export function selectDocument(_doc) {
  return async (dispatch, getState) => {
    const doc = _doc.toJS ? _doc.toJS() : _doc;
    const showingSemanticSearch = getState().library.sidepanel.tab === 'semantic-search-results';
    if (showingSemanticSearch && !doc.semanticSearch) {
      dispatch(actions.set('library.sidepanel.tab', ''));
    }
    await dispatch(maybeSaveQuickLabels());
    dispatch({ type: types.SELECT_DOCUMENT, doc });
    dispatch(selectedDocumentsChanged());
  };
}

export function getAndSelectDocument(sharedId) {
  return dispatch => {
    entitiesAPI.get(new RequestParams({ sharedId })).then(entity => {
      dispatch({ type: types.SELECT_SINGLE_DOCUMENT, doc: entity[0] });
    });
  };
}

export function selectDocuments(docs) {
  return async dispatch => {
    await dispatch(maybeSaveQuickLabels());
    dispatch({ type: types.SELECT_DOCUMENTS, docs });
    dispatch(selectedDocumentsChanged());
  };
}

export function unselectDocument(docId) {
  return async dispatch => {
    await dispatch(maybeSaveQuickLabels());
    dispatch({ type: types.UNSELECT_DOCUMENT, docId });
    dispatch(selectedDocumentsChanged());
  };
}

export function selectSingleDocument(doc) {
  return async dispatch => {
    await dispatch(maybeSaveQuickLabels());
    dispatch({ type: types.SELECT_SINGLE_DOCUMENT, doc });
    dispatch(selectedDocumentsChanged());
  };
}

export function unselectAllDocuments() {
  return async dispatch => {
    await dispatch(maybeSaveQuickLabels());
    dispatch({ type: types.UNSELECT_ALL_DOCUMENTS });
    dispatch(selectedDocumentsChanged());
  };
}

export function updateSelectedEntities(entities) {
  return { type: types.UPDATE_SELECTED_ENTITIES, entities };
}

export function showFilters() {
  return { type: types.SHOW_FILTERS };
}

export function hideFilters() {
  return { type: types.HIDE_FILTERS };
}

export function setDocuments(docs) {
  return { type: types.SET_DOCUMENTS, documents: docs };
}

export function addDocuments(docs) {
  return { type: types.ADD_DOCUMENTS, documents: docs };
}

export function unsetDocuments() {
  return { type: types.UNSET_DOCUMENTS };
}

export function setTemplates(templates, thesauris) {
  return dispatch => {
    dispatch({ type: types.SET_LIBRARY_TEMPLATES, templates, thesauris });
  };
}

export function setPreviewDoc(docId) {
  return { type: types.SET_PREVIEW_DOC, docId };
}

export function setSuggestions(suggestions) {
  return { type: types.SET_SUGGESTIONS, suggestions };
}

export function hideSuggestions() {
  return { type: types.HIDE_SUGGESTIONS };
}

export function showSuggestions() {
  return { type: types.SHOW_SUGGESTIONS };
}

export function setOverSuggestions(boolean) {
  return { type: types.OVER_SUGGESTIONS, hover: boolean };
}

export function zoomIn() {
  return { type: types.ZOOM_IN };
}

export function zoomOut() {
  return { type: types.ZOOM_OUT };
}

export function filterIsEmpty(value) {
  if (value && value.values && !value.values.length) {
    return true;
  }

  if (Array.isArray(value) && !value.length) {
    return true;
  }

  if (typeof value === 'string' && !value) {
    return true;
  }

  if (typeof value === 'object') {
    const hasValue = Object.keys(value).reduce(
      (result, key) => result || Boolean(value[key]),
      false
    );
    return !hasValue;
  }

  return false;
}

export function processFilters(readOnlySearch, filters, limit, from) {
  let search = {
    filters: {},
    ...readOnlySearch,
  };

  if (search.publishedStatus) {
    search = filterToQuery(search);
  }

  search.filters = {};

  filters.properties.forEach(property => {
    if (!filterIsEmpty(readOnlySearch.filters[property.name]) && !property.filters) {
      search.filters[property.name] = readOnlySearch.filters[property.name];
    }

    if (property.filters) {
      const searchFilter = { ...readOnlySearch.filters[property.name] };
      property.filters.forEach(filter => {
        if (filterIsEmpty(searchFilter[filter.name])) {
          delete searchFilter[filter.name];
        }
      });

      if (Object.keys(searchFilter).length) {
        search.filters[property.name] = searchFilter;
      }
    }
  });

  search.types = filters.documentTypes;
  search.limit = limit;
  search.from = from;
  return search;
}

export function encodeSearch(_search, appendQ = true) {
  const search = { ..._search };
  Object.keys(search).forEach(key => {
    if (search[key] && search[key].length === 0) {
      delete search[key];
    }

    if (typeof search[key] === 'object' && Object.keys(search[key]).length === 0) {
      delete search[key];
    }

    if (search[key] === '') {
      delete search[key];
    }
  });

  if (search.searchTerm) {
    search.searchTerm = `${encodeURIComponent(search.searchTerm).replace(/%20/g, ' ')}:`;
  }

  const encodedSearch = rison.encode(search).replace(/searchTerm:'([^:]+):'/, "searchTerm:'$1'");
  return appendQ ? `?q=${encodedSearch}` : encodedSearch;
}

function setSearchInUrl(searchParams) {
  const { pathname } = browserHistory.getCurrentLocation();
  const path = `${pathname}/`.replace(/\/\//g, '/');
  const query = browserHistory.getCurrentLocation().query || {};

  query.q = encodeSearch(searchParams, false);

  browserHistory.push(path + toUrlParams(query));
}

export function searchDocuments(
  { search = undefined, filters = undefined },
  storeKey,
  limit = 30,
  from = 0
) {
  return (dispatch, getState) => {
    const state = getState()[storeKey];
    const currentSearch = search || state.search;
    let currentFilters = filters || state.filters;
    currentFilters = currentFilters.toJS ? currentFilters.toJS() : currentFilters;

    const searchParams = processFilters(currentSearch, currentFilters, limit, from);
    searchParams.searchTerm = state.search.searchTerm;

    const { query } = browserHistory.getCurrentLocation();
    const currentSearchParams = rison.decode(decodeURIComponent(query.q || '()'));

    if (searchParams.searchTerm && searchParams.searchTerm !== currentSearchParams.searchTerm) {
      searchParams.sort = '_score';
    }

    if (currentSearch.userSelectedSorting) {
      dispatch(actions.set(`${storeKey}.selectedSorting`, currentSearch));
    }

    searchParams.customFilters = currentSearch.customFilters;

    setSearchInUrl(searchParams);
  };
}

export function elementCreated(doc) {
  return { type: types.ELEMENT_CREATED, doc };
}

export function updateEntity(updatedDoc) {
  return { type: types.UPDATE_DOCUMENT, doc: updatedDoc };
}

export function updateEntities(updatedDocs) {
  return { type: types.UPDATE_DOCUMENTS, docs: updatedDocs };
}

export function searchSnippets(searchString, sharedId, storeKey) {
  const requestParams = new RequestParams(
    qs.stringify({
      filter: { sharedId, searchString: `fullText:(${searchString})` },
      fields: ['snippets'],
    })
  );

  return dispatch =>
    searchAPI.searchSnippets(requestParams).then(({ data }) => {
      const snippets = data.length ? data[0].snippets : { total: 0, fullText: [], metadata: [] };
      dispatch(actions.set(`${storeKey}.sidepanel.snippets`, snippets));
      return snippets;
    });
}

export function saveDocument(doc, formKey) {
  return async dispatch => {
    const updatedDoc = await documentsApi.save(new RequestParams(doc));
    dispatch(notificationActions.notify('Document updated', 'success'));
    dispatch(formActions.reset(formKey));
    dispatch(updateEntity(updatedDoc));
    dispatch(actions.updateIn('library.markers', ['rows'], updatedDoc));
    await dispatch(selectSingleDocument(updatedDoc));
  };
}

export function multipleUpdate(entities, values) {
  return async dispatch => {
    const ids = entities.map(entity => entity.get('sharedId')).toJS();
    const updatedDocs = await entitiesAPI.multipleUpdate(new RequestParams({ ids, values }));
    dispatch(notificationActions.notify('Update success', 'success'));
    dispatch(updateEntities(updatedDocs));
  };
}

export function saveEntity(entity, formModel) {
  // eslint-disable-next-line max-statements
  return async dispatch => {
    const { entity: updatedDoc, errors } = await saveEntityWithFiles(entity, dispatch);
    let message = '';

    dispatch(formActions.reset(formModel));
    await dispatch(unselectAllDocuments());
    if (entity._id) {
      message = 'Entity updated';
      dispatch(updateEntity(updatedDoc));
      dispatch(actions.updateIn('library.markers', ['rows'], updatedDoc));
    } else {
      message = 'Entity created';
      dispatch(elementCreated(updatedDoc));
    }
    if (errors.length) {
      message = `${message} with the following errors: ${JSON.stringify(errors, null, 2)}`;
    }
    await dispatch(notificationActions.notify(message, errors.length ? 'warning' : 'success'));
    await dispatch(selectSingleDocument(updatedDoc));
  };
}

export function removeDocument(doc) {
  return { type: types.REMOVE_DOCUMENT, doc };
}

export function removeDocuments(docs) {
  return { type: types.REMOVE_DOCUMENTS, docs };
}

export function deleteDocument(doc) {
  return async dispatch => {
    await documentsApi.delete(new RequestParams({ sharedId: doc.sharedId }));
    dispatch(notificationActions.notify('Document deleted', 'success'));
    await dispatch(unselectAllDocuments());
    dispatch(removeDocument(doc));
  };
}

export function deleteEntity(entity) {
  return async dispatch => {
    await entitiesAPI.delete(entity);
    dispatch(notificationActions.notify('Entity deleted', 'success'));
    await dispatch(unselectDocument(entity._id));
    dispatch(removeDocument(entity));
  };
}

export function loadMoreDocuments(storeKey, amount, from) {
  return (dispatch, getState) => {
    const { search } = getState()[storeKey];
    searchDocuments({ search }, storeKey, amount, from)(dispatch, getState);
  };
}

export function getSuggestions() {
  return { type: 'GET_SUGGESTIONS' };
}

export function getDocumentReferences(sharedId, fileId, storeKey) {
  return dispatch =>
    referencesAPI
      .get(new RequestParams({ sharedId, file: fileId, onlyTextReferences: true }))
      .then(references => {
        dispatch(actions.set(`${storeKey}.sidepanel.references`, references));
      });
}

export function getAggregationSuggestions(storeKey, property, searchTerm) {
  const state = store.getState()[storeKey];
  const { search, filters } = state;

  const query = processFilters(search, filters.toJS(), 0);
  query.searchTerm = search.searchTerm;
  if (storeKey === 'uploads') {
    query.unpublished = true;
  }
  return searchAPI.getAggregationSuggestions(new RequestParams({ query, property, searchTerm }));
}

export function setTableViewColumns(columns) {
  return { type: types.SET_TABLE_VIEW_COLUMNS, columns };
}

export function setTableViewColumnHidden(name, hidden) {
  return {
    type: types.SET_TABLE_VIEW_COLUMN_HIDDEN,
    name,
    hidden,
  };
}

export function setTableViewAllColumnsHidden(hidden) {
  return {
    type: types.SET_TABLE_VIEW_ALL_COLUMNS_HIDDEN,
    hidden,
  };
}
