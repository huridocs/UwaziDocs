/**
 * @jest-environment jsdom
 */
import React from 'react';
import { formReducer, FormState } from 'react-redux-form';
import { combineReducers, createStore } from 'redux';
import { fromJS } from 'immutable';
import { fireEvent, RenderResult, screen } from '@testing-library/react';
import { defaultState, renderConnectedContainer } from 'app/utils/test/renderConnected';
import * as libraryActions from 'app/Library/actions/libraryActions';
import { IStore } from 'app/istore';
import { IImmutable } from 'shared/types/Immutable';
import { LibraryHeader, LibraryHeaderOwnProps } from '../LibraryHeader';

describe('LibraryHeader', () => {
  let renderResult: RenderResult;
  const props: LibraryHeaderOwnProps = {
    storeKey: 'library',
    counter: <span>counter</span>,
    selectAllDocuments: jest.fn(),
    sortButtonsStateProperty: 'library.search',
  };

  const reducer = combineReducers({
    form: formReducer('library.search', {
      searchTerm: 'Find my document',
      sort: 'title',
    }),
  });

  let state: Partial<Omit<IStore, 'library'>> & {
    library: {
      ui: IImmutable<{}>;
      search: { searchTerm?: string; sort?: string };
      filters: IImmutable<{}>;
      searchForm: any;
    };
  };

  const storeState = createStore(reducer).getState() as { form: FormState };

  state = {
    ...defaultState,
    templates: fromJS([
      {
        _id: 'template1',
        name: 'Template 1',
        properties: [
          { _id: 'property2', name: 'number', label: 'number', type: 'number', filter: true },
        ],
      },
      {
        _id: 'template2',
        name: 'Template 2',
        properties: [
          { _id: 'property1', name: 'text', label: 'text', type: 'text', filter: true },
          {
            _id: 'property3',
            name: 'geolocation',
            label: 'geolocation',
            type: 'geolocation',
            filter: true,
          },
        ],
      },
    ]),
    library: {
      ui: fromJS({ filtersPanel: [], selectedDocuments: [], zoomLevel: 2 }),
      filters: fromJS({ documentTypes: ['template2'], properties: [] }),
      search: {
        sort: 'desc',
      },
      searchForm: { ...storeState.form },
    },
    settings: {
      collection: fromJS({}),
    },
    user: fromJS({}),
  };

  const render = () => {
    ({ renderResult } = renderConnectedContainer(<LibraryHeader {...props} />, () => state));
  };

  it('should hold sortButtons with search callback and selectedTemplates', () => {
    jest.spyOn(libraryActions, 'searchDocuments');
    render();
    screen.debug();
    fireEvent.click(screen.getByTitle('open dropdown'));

    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]);

    expect(options.map(option => option.textContent)).toEqual([
      'Title',
      'Date added',
      'Date modified',
      'text',
    ]);
    expect(libraryActions.searchDocuments).toHaveBeenCalledWith(
      {
        search: {
          order: 'desc',
          sort: 'creationDate',
          userSelectedSorting: true,
        },
      },
      'library'
    );
  });

  it('should render a Select All button only if authorized', () => {
    render();
    expect(screen.queryByText('Select all')).not.toBeInTheDocument();
    state.user = fromJS({ _id: 'user1', role: 'admin' });
    renderResult.unmount();
    render();
    expect(screen.queryByText('Select all')).toBeInTheDocument();
  });
});
