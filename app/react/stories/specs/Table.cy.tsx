import React from 'react';
import { mount } from '@cypress/react18';
import { composeStories } from '@storybook/testing-react';
import { map } from 'lodash';
import * as stories from '../Table.stories';

const { Basic } = composeStories(stories);

describe('Table', () => {
  beforeEach(() => {
    mount(<Basic />);
  });

  const checkRowContent = (rowNumber: number, cellsContent: string[]) => {
    cellsContent.forEach((content, index) =>
      cy.get(`tbody>tr:nth-child(${rowNumber}) td:nth-child(${index + 2})`).contains(content)
    );
  };

  it('Should return a table with the columns and row specified', () => {
    const toStrings = (cells: JQuery<HTMLElement>) => map(cells, 'textContent');
    cy.get('tr th').then(toStrings).should('eql', ['', 'Icon', 'Title', 'Date added']);
    cy.get('tbody>tr td').get('[type="checkbox"]');

    checkRowContent(1, ['plus', 'Entity 2', '2']);
    checkRowContent(2, ['check', 'Entity 1', '1']);
    checkRowContent(3, ['flag', 'Entity 3', '3']);
  });

  it('Should be sortable by title', () => {
    cy.get('tr th').contains('Title').click();
    checkRowContent(1, ['check', 'Entity 1', '1']);
    checkRowContent(2, ['plus', 'Entity 2', '2']);
    checkRowContent(3, ['flag', 'Entity 3', '3']);
  });
});
