import React from 'react';
import { mount } from '@cypress/react18';
import { composeStories } from '@storybook/testing-react';
import _ from 'lodash';
import * as stories from '../LocalTable.stories';

const { Basic } = composeStories(stories);

describe('LocalTable.cy.tsx', () => {
  beforeEach(() => {
    mount(<Basic />);
  });

  const checkRowContent = (rowNumber: number, cellsContent: string[]) => {
    cellsContent.forEach((content, index) =>
      cy.get(`tbody>tr:nth-child(${rowNumber}) td:nth-child(${index + 2})`).contains(content)
    );
  };

  it('Should return a table with the columns and row specified', () => {
    const toStrings = (cells: JQuery<HTMLElement>) => _.map(cells, 'textContent');
    cy.get('tr th').then(toStrings).should('eql', ['', 'Icon', 'Title', 'Date added']);
    cy.get('tbody>tr td').get('[type="checkbox"]');
    checkRowContent(1, ['check', 'Entity 1', '1676306456']);
    checkRowContent(2, ['plus', 'Entity 2', '1676425085']);
  });

  it('Should be sortable by title', () => {
    cy.get('tr th').contains('Title').click();
    checkRowContent(1, ['plus', 'Entity 2', '1676425085']);
    checkRowContent(2, ['check', 'Entity 1', '1676306456']);
  });

  it('Should set the specified class of a cell', () => {
    cy.get('tbody>tr:nth-child(1) td:nth-child(3)').should('not.have.class', 'italic');
    cy.get('tbody>tr:nth-child(1) td:nth-child(4)').should('have.class', 'italic');
  });
});
