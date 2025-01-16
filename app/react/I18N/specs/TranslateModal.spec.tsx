/**
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import { TestAtomStoreProvider } from 'V2/testing';
import { settingsAtom, translationsAtom, inlineEditAtom } from 'V2/atoms';
import * as translationsAPI from 'V2/api/translations';
import { TranslateModal } from '../TranslateModal';
import { languages, translations } from './fixtures';

describe('TranslateModal', () => {
  let renderResult: RenderResult;

  beforeAll(() => {
    jest.spyOn(translationsAPI, 'postV2').mockImplementationOnce(async () => Promise.resolve([]));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (inlineEdit: boolean, context: string, translationKey: string) => {
    renderResult = render(
      <TestAtomStoreProvider
        initialValues={[
          [settingsAtom, { languages }],
          [translationsAtom, translations],
          [inlineEditAtom, { inlineEdit, context, translationKey }],
        ]}
      >
        <TranslateModal />
      </TestAtomStoreProvider>
    );
  };

  it('renders the modal with fields for each language', () => {
    renderComponent(true, 'System', 'Search');
    const inputFields = renderResult.queryAllByRole('textbox');
    expect(inputFields).toHaveLength(2);
    expect(inputFields[0]).toHaveValue('Search');
    expect(inputFields[1]).toHaveValue('Buscar');
    expect(renderResult.getByText('EN'));
    expect(renderResult.getByText('ES'));
  });

  it('should close the modal without saving', async () => {
    renderComponent(true, 'System', 'Search');
    expect(renderResult.getByText('Translate'));
    await act(() => {
      fireEvent.click(renderResult.getByText('Cancel'));
    });
    expect(renderResult.queryByText('Translate')).not.toBeInTheDocument();
    expect(translationsAPI.postV2).not.toHaveBeenCalled();
  });

  it('submits the form with updated values and closes the modal', async () => {
    renderComponent(true, 'System', 'Search');
    const saveButton = renderResult.getByTestId('save-button');
    const inputFields = renderResult.queryAllByRole('textbox');

    await act(() => {
      fireEvent.change(inputFields[1], { target: { value: 'Busqueda' } });
      fireEvent.click(saveButton);
    });

    expect(translationsAPI.postV2).toHaveBeenCalledWith(
      [
        { language: 'en', value: 'Search', key: 'Search' },
        { language: 'es', value: 'Busqueda', key: 'Search' },
      ],
      translations[0].contexts[0]
    );
    expect(renderResult.queryByText('Translate')).not.toBeInTheDocument();
  });

  it('should not allow sending empty fields', () => {});

  it('should use the default context key if translation does not exist', () => {});
});
