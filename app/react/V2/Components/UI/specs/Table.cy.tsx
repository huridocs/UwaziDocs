/* eslint-disable max-statements */
import React from 'react';
import 'cypress-axe';
import { mount } from '@cypress/react18';
import { map } from 'lodash';
import { composeStories } from '@storybook/react';
import * as stories from 'app/stories/TableV2.stories';

const { Basic } = composeStories(stories);

describe('Table', () => {
  const data = Basic.args.data || [];

  const checkRowContent = (rowNumber: number, cellsContent: string[]) => {
    cellsContent.forEach((content, index) =>
      cy.get(`tbody > :nth-child(${rowNumber}) > :nth-child(${index + 1})`).contains(content)
    );
  };

  it('should be accessible', () => {
    cy.injectAxe();
    Basic.args.checkboxes = true;
    mount(<Basic />);
    cy.checkA11y();
  });

  it('Should return a table with the columns and row specified', () => {
    Basic.args.checkboxes = false;
    Basic.args.sorting = undefined;
    mount(<Basic />);
    const toStrings = (cells: JQuery<HTMLElement>) => map(cells, 'textContent');
    cy.get('tr th').then(toStrings).should('eql', ['Title', 'Description', 'Date added']);

    checkRowContent(1, ['Entity 2', data[0].description, '2']);
    checkRowContent(2, ['Entity 1', data[1].description, '1']);
    checkRowContent(3, ['Entity 4', data[2].description, '4']);
    checkRowContent(4, ['Entity 3', data[3].description, '3']);
    checkRowContent(5, ['Entity 5', data[4].description, '5']);
  });

  xit('Should sort the rows with the sorting state specified', () => {
    mount(<WithInitialState />);

    checkRowContent(1, ['Entity 2', data[0].description, '2']);
    checkRowContent(2, ['Entity 3', data[2].description, '3']);
    checkRowContent(3, ['Entity 1', data[1].description, '1']);
  });

  xit('should render the data in a custom component', () => {
    mount(<Basic />);
    cy.get('tbody > :nth-child(1) > :nth-child(3) > div').should(
      'have.class',
      'text-center text-white bg-gray-400 rounded'
    );
  });

  xit('should render the header appending custom styles passed in the definition of the columns', () => {
    mount(<WithActions />);
    cy.get('table > thead > tr > th:nth-child(3)').should(
      'have.class',
      'px-6 py-3 w-1/4 bg-error-100 text-blue-600'
    );
  });

  xdescribe('Sorting', () => {
    it('Should be sortable by title', () => {
      mount(<Basic />);
      cy.get('tr th').contains('Title').click();
      checkRowContent(1, ['Entity 1', data[1].description, '1']);
      checkRowContent(2, ['Entity 2', data[0].description, '2']);
      checkRowContent(3, ['Entity 3', data[2].description, '3']);
    });

    it('should disable sorting when defined in the columns', () => {
      mount(<WithActions />);
      cy.get('tr th').contains('Description').click();
      checkRowContent(1, ['Entity 2', '2', data[0].description]);
    });

    it('should allow external control of sorting', () => {
      const setSortingSpy = cy.stub().as('setSortingSpy');

      mount(<Basic setSorting={setSortingSpy} />);
      cy.get('tr th').contains('Title').click();

      cy.get('@setSortingSpy').should('have.been.calledOnce');
    });
  });

  describe('Selections', () => {
    beforeEach(() => {
      Basic.args.checkboxes = true;
      Basic.args.sorting = undefined;
      mount(<Basic />);
    });

    it('should select and uselect some items', () => {
      cy.contains('Select all').click();

      cy.get('tbody').within(() => {
        cy.get('input[type="checkbox"]').eq(0).uncheck();
        cy.get('input[type="checkbox"]').eq(2).uncheck();
      });

      cy.get('[data-testid="selected-items"]').within(() => {
        cy.contains('Entity 1');
        cy.contains('Entity 2').should('not.exist');
        cy.contains('Entity 3');
        cy.contains('Entity 4').should('not.exist');
        cy.contains('Entity 5');
      });
    });

    xit('should clear selected items when data changes', () => {
      cy.contains('Short text');
      cy.get('[data-testid="table"]').eq(0).get('thead > tr > th').eq(0).click();

      cy.get('tbody')
        .eq(1)
        .within(() => {
          cy.get('input[type="checkbox"]').eq(0).check();
          cy.get('input[type="checkbox"]').eq(2).check();
        });

      cy.contains('button', 'Update table data').click();

      cy.contains('p', 'Selections of Table A: Entity 2, Entity 1, Entity 3,');
      cy.contains('p', 'Selections of Table B: Entity 2, Entity 3,').should('not.exist');
    });

    xit('should not clear selections if data is not changed', () => {
      cy.contains('Short text');
      cy.get('[data-testid="table"]')
        .eq(1)
        .within(() => cy.get('thead > tr > th').eq(0).click());

      cy.contains('button', 'Reset table data').click();
      cy.contains('p', 'Selections of Table B: Entity 2, Entity 1, Entity 3,');
    });
  });

  describe('DnD', () => {
    beforeEach(() => {
      Basic.args.sorting = 'dnd';
      mount(<Basic />);
      cy.get('[data-testid="sorted-items"]').within(() => {
        cy.contains('Entity 2 Entity 1 Entity 4 Entity 3 Entity 5');
      });
    });

    it('should sort rows by dragging', () => {
      cy.contains('button', 'Drag row 2').drag('button:contains("Drag row 1")', {
        target: { x: 5, y: 0 },
        force: true,
      });

      cy.contains('button', 'Drag row 3').drag('button:contains("Drag row 4")', {
        target: { x: 5, y: 0 },
        force: true,
      });

      checkRowContent(1, ['Drag row 1', 'Select', 'Entity 1', data[1].description, '1']);
      checkRowContent(2, ['Drag row 2', 'Select', 'Entity 2', data[0].description, '2']);
      checkRowContent(3, ['Drag row 3', 'Select', 'Entity 3', data[3].description, '3']);
      checkRowContent(4, ['Drag row 4', 'Select', 'Entity 4', data[2].description, '4']);
      checkRowContent(5, ['Drag row 5', 'Select', 'Entity 5', data[4].description, '5']);

      cy.get('[data-testid="sorted-items"]').within(() => {
        cy.contains('Entity 1 Entity 2 Entity 3 Entity 4 Entity 5');
      });
    });

    it('should keep selections while sorting', () => {
      cy.get('tbody').within(() => {
        cy.get('input[type="checkbox"]').eq(0).check();
        cy.get('input[type="checkbox"]').eq(2).check();
      });

      cy.contains('button', 'Drag row 2').drag('button:contains("Drag row 1")', {
        target: { x: 5, y: 0 },
        force: true,
      });

      cy.contains('button', 'Drag row 3').drag('button:contains("Drag row 4")', {
        target: { x: 5, y: 0 },
        force: true,
      });

      cy.get('[data-testid="selected-items"]').within(() => {
        cy.contains('Entity 1').should('not.exist');
        cy.contains('Entity 2');
        cy.contains('Entity 3').should('not.exist');
        cy.contains('Entity 4');
        cy.contains('Entity 5').should('not.exist');
      });
    });
  });

  xdescribe('Nested DnD', () => {
    it('should render children as subRows', () => {
      mount(<NestedDnD />);

      checkRowContent(1, ['Entity 2', data[0].description, '2']);
      checkRowContent(2, ['Entity 1', data[1].description, '1']);
      checkRowContent(3, ['Entity 3', data[2].description, '3']);

      cy.get('[data-testid="update_items"] > ul > li').should('have.length', 0);
    });

    it('should expand a group', () => {
      mount(<NestedDnD />);

      cy.contains('children').click();

      checkRowContent(1, ['Entity 2', data[0].description, '2']);
      checkRowContent(2, ['Entity 1', data[1].description, '1']);
      checkRowContent(3, ['Entity a', data[1].children![0].description, '4']);
      checkRowContent(4, ['Entity b', data[1].children![1].description, '5']);
      checkRowContent(5, ['Entity 3', data[2].description, '3']);

      cy.get('[data-testid="update_items"] > ul > li').should('have.length', 0);
    });

    it('should sort an expanded row', () => {
      mount(<NestedDnD />);
      cy.contains('children').click();

      cy.get('[data-testid="root-draggable-item-1"]').drag(
        '[data-testid="root-draggable-item-0"]',
        {
          target: { x: 5, y: 0 },
          force: true,
        }
      );

      checkRowContent(1, ['Entity 1', data[1].description, '1']);
      checkRowContent(2, ['Entity 2', data[0].description, '2']);
      checkRowContent(3, ['Entity 3', data[2].description, '3']);

      cy.get('[data-testid="update_items"] > ul > li')
        .should('have.length', 3)
        .then($els => Cypress.$.makeArray($els).map(el => el.innerText))
        .should('deep.equal', ['Entity 1 Entity a, Entity b', 'Entity 2', 'Entity 3']);
    });

    it('should sort an expanded row by the header', () => {
      mount(<NestedDnD />);
      cy.contains('children').click();
      cy.get('[data-testid="created_false"]').click();
      cy.contains('children').click();
      checkRowContent(1, ['Entity 3', data[2].description, '3']);
      checkRowContent(2, ['Entity 2', data[0].description, '2']);
      checkRowContent(3, ['Entity 1', data[1].description, '1']);
      checkRowContent(4, ['Entity a', data[1].children![0].description, '4']);
      checkRowContent(5, ['Entity b', data[1].children![1].description, '5']);
    });

    const checkChildrenSorting = (from: string, to: string, target: { x: number; y: number }) => {
      mount(<NestedDnD />);

      cy.contains('children').click();
      cy.get(from).drag(to, {
        target,
        force: true,
      });

      checkRowContent(1, ['Entity 2', data[0].description, '2']);
      checkRowContent(2, ['Entity 1', data[1].description, '1']);
      checkRowContent(3, ['Entity b', data[1].children![1].description, '5']);
      checkRowContent(4, ['Entity a', data[1].children![0].description, '4']);
      checkRowContent(5, ['Entity 3', data[2].description, '3']);

      cy.get('[data-testid="update_items"] > ul > li')
        .should('have.length', 3)
        .then($els => Cypress.$.makeArray($els).map(el => el.innerText))
        .should('deep.equal', ['Entity 2', 'Entity 1 Entity b, Entity a', 'Entity 3']);
    };

    it('should sort children of a group from top to bottom', () => {
      checkChildrenSorting(
        '[data-testid="group_1-draggable-item-0"]',
        '[data-testid="group_1.1"]',
        { x: 5, y: 30 }
      );
    });

    it('should sort children of a group from bottom to top', () => {
      checkChildrenSorting(
        '[data-testid="group_1-draggable-item-1"]',
        '[data-testid="group_1.0"]',
        { x: 5, y: 0 }
      );
    });

    it('should move a parent into a group', () => {
      mount(<NestedDnD />);
      cy.contains('children').click();

      cy.get('[data-testid="root-draggable-item-0"]').trigger('dragstart');
      cy.get('[data-testid="root-draggable-item-0"]').trigger('dragleave');
      cy.get('[data-testid="group_1.0"]').trigger('drop', {
        target: { x: 5, y: 0 },
      });
      cy.get('[data-testid="root-draggable-item-0"]').trigger('dragend');
      cy.contains('children').click();
      checkRowContent(1, ['Entity 1', data[1].description, '1']);
      checkRowContent(2, ['Entity a', data[1].children![0].description, '4']);
      checkRowContent(3, ['Entity b', data[1].children![1].description, '5']);
      checkRowContent(4, ['Entity 2', data[0].description, '2']);
      checkRowContent(5, ['Entity 3', data[2].description, '3']);

      cy.get('[data-testid="update_items"] > ul > li')
        .should('have.length', 2)
        .then($els => Cypress.$.makeArray($els).map(el => el.innerText))
        .should('deep.equal', ['Entity 1 Entity a, Entity b, Entity 2', 'Entity 3']);
    });

    it('should move a child outsides a group', () => {
      mount(<NestedDnD />);
      cy.contains('children').click();

      cy.get('[data-testid="group_1-draggable-item-0"]').drag(
        '[data-testid="root-draggable-item-0"]',
        {
          target: { x: 5, y: 0 },
          force: true,
        }
      );
      cy.get('[data-testid="group_1-draggable-item-0"]').trigger('dragend');
      cy.contains('children').click();
      checkRowContent(1, ['Entity 2', data[0].description, '2']);
      checkRowContent(2, ['Entity 1', data[1].description, '1']);
      checkRowContent(3, ['Entity 3', data[2].description, '3']);
      checkRowContent(4, ['Entity a', data[1].children![0].description, '4']);

      cy.get('[data-testid="update_items"] > ul > li')
        .should('have.length', 4)
        .then($els => Cypress.$.makeArray($els).map(el => el.innerText))
        .should('deep.equal', ['Entity 2', 'Entity 1 Entity b', 'Entity 3', 'Entity a']);
    });

    describe('Fixed groups', () => {
      it('should not move a child outsides a group if editableGroups is false', () => {
        mount(<NestedDnD allowEditGroupsWithDnD={false} />);
        cy.contains('children').click();

        cy.get('[data-testid="group_1-draggable-item-0"]').drag(
          '[data-testid="root-draggable-item-1"]',
          {
            target: { x: 5, y: 0 },
            force: true,
          }
        );
        cy.get('[data-testid="group_1-draggable-item-0"]').trigger('dragend');
        checkRowContent(1, ['Entity 2', data[0].description, '2']);
        checkRowContent(2, ['Entity 1', data[1].description, '1']);
        checkRowContent(3, ['Entity a', data[1].children![0].description, '4']);
        checkRowContent(4, ['Entity b', data[1].children![1].description, '5']);
        checkRowContent(5, ['Entity 3', data[2].description, '3']);
      });
    });
  });
});
