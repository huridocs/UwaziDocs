import Immutable from 'immutable';

import * as types from 'app/Library/actions/actionTypes';
import * as uploadTypes from 'app/Uploads/actions/actionTypes';
import * as attachmentTypes from 'app/Attachments/actions/actionTypes';

const initialState = { rows: [], totalRows: 0 };

export default function documents(state = initialState, action = {}) {
  if (action.type === types.SET_DOCUMENTS) {
    return Immutable.fromJS(action.documents);
  }

  if (action.type === types.ADD_DOCUMENTS) {
    return state
      .setIn(['rows'], state.get('rows').concat(Immutable.fromJS(action.documents.rows)))
      .setIn(['totalRows'], action.documents.totalRows);
  }

  if (action.type === types.UPDATE_DOCUMENT) {
    const docIndex = state.get('rows').findIndex(doc => doc.get('_id') === action.doc._id);
    return state.setIn(['rows', docIndex], Immutable.fromJS(action.doc));
  }

  if (action.type === types.UPDATE_DOCUMENTS) {
    return action.docs.reduce((_state, doc) => {
      const docIndex = state.get('rows').findIndex(_doc => _doc.get('_id') === doc._id);

      return _state.setIn(['rows', docIndex], Immutable.fromJS(doc));
    }, state);
  }

  if (action.type === types.UPDATE_DOCUMENTS_PUBLISHED) {
    return action.sharedIds.reduce((_state, sharedId) => {
      const docIndex = state.get('rows').findIndex(_doc => _doc.get('sharedId') === sharedId);

      return _state.setIn(['rows', docIndex, 'published'], action.published);
    }, state);
  }

  if (action.type === types.ELEMENT_CREATED) {
    return state.update('rows', rows => rows.insert(0, Immutable.fromJS(action.doc)));
  }

  if (action.type === uploadTypes.UPLOAD_COMPLETE) {
    const docIndex = state.get('rows').findIndex(doc => doc.get('sharedId') === action.doc);

    const doc = state.get('rows').get(docIndex).toJS();
    doc.documents.push(action.file);
    return state.setIn(['rows', docIndex], Immutable.fromJS(doc));
  }

  if (
    [
      attachmentTypes.ATTACHMENT_COMPLETE,
      attachmentTypes.ATTACHMENT_DELETED,
      attachmentTypes.ATTACHMENT_RENAMED,
    ].includes(action.type)
  ) {
    const docIndex = state.get('rows').findIndex(doc => doc.get('sharedId') === action.entity);
    const doc = state.get('rows').get(docIndex).toJS();

    if (action.type === attachmentTypes.ATTACHMENT_COMPLETE) {
      doc.attachments.push(action.file);
    } else if (action.type === attachmentTypes.ATTACHMENT_RENAMED) {
      const file = doc.attachments.filter(att => att._id === action.file._id)[0];
      file.originalname = action.file.originalname;
    } else {
      doc.attachments = doc.attachments.filter(att => att._id !== action.file._id);
    }
    return state.setIn(['rows', docIndex], Immutable.fromJS(doc));
  }

  if (action.type === uploadTypes.DOCUMENT_PROCESS_ERROR) {
    const docIndex = state.get('rows').findIndex(doc => doc.get('sharedId') === action.sharedId);

    const doc = state.get('rows').get(docIndex).toJS();
    doc.documents[0].status = 'failed';
    return state.setIn(['rows', docIndex], Immutable.fromJS(doc));
  }

  if (action.type === types.REMOVE_DOCUMENT) {
    const docIndex = state.get('rows').findIndex(doc => doc.get('_id') === action.doc._id);

    if (docIndex >= 0) {
      return state.deleteIn(['rows', docIndex]);
    }

    return state;
  }

  if (action.type === types.UNSET_DOCUMENTS) {
    return Immutable.fromJS(initialState);
  }

  const removeDocuments = (items, currentState, getFilter, updateTotalRows = false) =>
    items.reduce((_state, item) => {
      const docIndex = _state.get('rows').findIndex(getFilter(item));

      if (docIndex >= 0) {
        const newState = _state.deleteIn(['rows', docIndex]);
        if (!updateTotalRows) {
          return newState;
        }
        return newState.set('totalRows', newState.get('totalRows') - 1);
      }
      return _state;
    }, currentState);

  if (action.type === types.REMOVE_DOCUMENTS) {
    const getFilterByObjectWithId = itemToSearch => candidateItem =>
      candidateItem.get('_id') === itemToSearch._id;

    return removeDocuments(action.docs, state, getFilterByObjectWithId);
  }

  if (action.type === types.REMOVE_DOCUMENTS_SHAREDIDS) {
    const getFilterBySharedId = sharedIdToSearch => candidateItem =>
      candidateItem.get('sharedId') === sharedIdToSearch;

    return removeDocuments(action.sharedIds, state, getFilterBySharedId, true);
  }

  return Immutable.fromJS(state);
}
