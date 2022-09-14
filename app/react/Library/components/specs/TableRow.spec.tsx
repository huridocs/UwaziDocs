/**
 * @jest-environment jsdom
 */
import React from 'react';
import Immutable from 'immutable';
import { fireEvent, screen } from '@testing-library/react';

import { renderConnectedContainer } from 'app/utils/test/renderConnected';
import { TableRow } from 'app/Library/components/TableRow';
import { EntitySchema } from 'shared/types/entityType';
import { TableViewColumn } from 'app/istore';
import { IImmutable } from 'shared/types/Immutable';

describe('TableRow', () => {
  const formattedPropertyDate = 'May 20, 2019';

  const commonColumns: TableViewColumn[] = [
    {
      label: 'Title1',
      type: 'text',
      name: 'title',
      isCommonProperty: true,
      hidden: false,
    },
    {
      label: 'Created at',
      type: 'date',
      name: 'creationDate',
      isCommonProperty: true,
      hidden: false,
    },
    {
      label: 'Template',
      type: 'text',
      name: 'templateName',
      isCommonProperty: true,
      hidden: false,
    },
  ];
  const templateColumns: TableViewColumn[] = [
    { label: 'Date', type: 'date', name: 'date', isCommonProperty: false, hidden: false },
    {
      label: 'Country',
      type: 'select',
      name: 'country',
      content: 'idThesauri1',
      isCommonProperty: false,
      hidden: false,
    },
    {
      label: 'Summary',
      type: 'text',
      name: 'summary',
      isCommonProperty: false,
      hidden: false,
    },
  ];
  const clickOnDocumentSpy = jest.fn();
  const setMultipleSelectionSpy = jest.fn();
  const timestampCreation = Date.UTC(2020, 6, 23).valueOf();
  const timestampProperty = Math.floor(Date.UTC(2019, 4, 20).valueOf() / 1000);
  const entity: IImmutable<EntitySchema> = Immutable.fromJS({
    _id: 'selectedEntity1',
    title: 'entity1',
    creationDate: timestampCreation,
    template: 'idTemplate1',
    metadata: {
      date: [
        {
          value: timestampProperty,
        },
      ],
      country: [{ value: 'cv1', label: 'Colombia' }],
      summary: [{ value: 'Mrs' }],
    },
  });
  const storeState = {
    settings: { collection: Immutable.fromJS({ dateFormat: 'dd-mm-yyyy' }) },
    library: { ui: Immutable.fromJS({ selectedDocuments: [{ _id: 'selectedEntity1' }] }) },
    thesauris: Immutable.fromJS([
      {
        _id: 'idThesauri1',
        name: 'countries',
        values: [
          { _id: 'cv1', id: 'cv1', label: 'Colombia' },
          { _id: 'cv2', id: 'cv2', label: 'Peru' },
        ],
      },
      {
        _id: 'idThesauri2',
        name: 'languages',
        values: [
          { _id: 'lv1', id: 'lv1', label: 'Español' },
          { _id: 'lv2', id: 'lv2', label: 'English' },
        ],
      },
    ]),
    templates: Immutable.fromJS([
      {
        _id: 'idTemplate1',
        name: 'Template1',
        properties: templateColumns,
      },
      {
        _id: 'idTemplate2',
        name: 'Template2',
        properties: [{ label: 'Date', type: 'date', name: 'date' }],
      },
    ]),
  };
  const props = {
    entity,
    columns: commonColumns.concat(templateColumns),
    clickOnDocument: clickOnDocumentSpy,
    multipleSelection: false,
    setMultipleSelection: setMultipleSelectionSpy,
  };

  function render(multipleSelection: boolean = false) {
    const actualProps = { ...props, multipleSelection };
    renderConnectedContainer(
      <table>
        <tbody>
          <TableRow {...actualProps} />
        </tbody>
      </table>,
      () => storeState
    );
  }

  describe('row format', () => {
    it('should namespace the row with the template id', () => {
      render();
      const row = screen.getByRole('row');
      expect(row.className).toContain('template-idTemplate1');
    });
  });

  describe('columns format', () => {
    it('should render a column with the expected columns', () => {
      render();
      const renderedColumns = screen.getAllByRole('cell');
      const content = renderedColumns.map(col => col.textContent);
      expect(content).toEqual([
        'entity1',
        expect.stringMatching(/^Jul 2[2|3], 2020$/),
        'Template1',
        formattedPropertyDate,
        'Colombia',
        'Mrs',
      ]);
    });
  });

  describe('row selection', () => {
    beforeEach(() => {
      clickOnDocumentSpy.mockClear();
      setMultipleSelectionSpy.mockClear();
    });

    it.each`
      roleToClick   | multipleCallExpected
      ${'row'}      | ${false}
      ${'checkbox'} | ${true}
    `(
      'should call clickOnDocument from $roleToClick with multiple selection as $multipleCallExpected',
      () => {
        render(true);
        const row = screen.getByRole('row');
        fireEvent.click(row);
        expect(clickOnDocumentSpy).toHaveBeenCalledWith(
          { ctrlKey: false, metaKey: false, shiftKey: false },
          entity,
          true,
          false
        );
        expect(setMultipleSelectionSpy).toHaveBeenCalledWith(false);
      }
    );

    it('should call clickOnDocument with multiple selection with event information', () => {
      render();
      const row = screen.getByRole('row');
      fireEvent.click(row, { shiftKey: true });
      expect(clickOnDocumentSpy).toHaveBeenCalledWith(
        { ctrlKey: false, metaKey: false, shiftKey: true },
        entity,
        true,
        true
      );
      expect(setMultipleSelectionSpy).toHaveBeenCalledWith(true);
    });

    it('should not call clickOnDocument if there is text selected', () => {
      render();
      spyOn(window, 'getSelection').and.returnValue({ type: 'Range' });
      const row = screen.getByRole('row');
      fireEvent.click(row, { type: 'Range' });
      expect(clickOnDocumentSpy).not.toHaveBeenCalled();
      expect(setMultipleSelectionSpy).not.toHaveBeenCalled();
    });
  });
});
