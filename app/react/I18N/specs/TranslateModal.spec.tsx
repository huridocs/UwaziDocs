/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { TestAtomStoreProvider } from 'V2/testing';
import { settingsAtom, translationsAtom, inlineEditAtom } from 'V2/atoms';
import * as translationsAPI from 'V2/api/translations';
import { TranslateModal } from '../TranslateModal';
import { languages, translations } from './fixtures';

describe('TranslateModal', () => {
  let renderResult: RenderResult;

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

  it('submits the form with updated values and closes the modal', async () => {
    jest
      .spyOn(translationsAPI, 'postV2')
      .mockImplementationOnce(async () => Promise.resolve(translations));

    renderComponent(true, 'System', 'Search');
    const saveButton = renderResult.getByTestId('save-button');
    const inputFields = renderResult.queryAllByRole('textbox');

    fireEvent.change(inputFields[1], { target: { value: 'Busqueda' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(translationsAPI.postV2).toHaveBeenCalledWith([
        { language: 'en', value: 'Search', key: 'Search' },
        { language: 'es', value: 'Busqueda', key: 'Search' },
      ]);
    });
  });

  it('should not allow sending empty fields', () => {});

  it('should use the default context key if translation does not exist', () => {});
});
