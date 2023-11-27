/* eslint-disable max-statements */
import 'cypress-axe';
import { clearCookiesAndLogin } from '../helpers/login';

describe('Menu configuration', () => {
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn blank-state', { env });
    clearCookiesAndLogin('admin', 'change this password now');
    cy.get('.only-desktop a[aria-label="Settings"]').click();
    cy.injectAxe();
    cy.contains('span', 'Menu').click();
  });

  it('should have no detectable accessibility violations on load', () => {
    cy.checkA11y();
  });

  beforeEach(() => {
    cy.intercept('GET', 'api/settings/links').as('fetchLinks');
  });

  it('tests add links', () => {
    cy.getByTestId('menu-add-link').click();
    cy.get('#link-title').click();
    cy.get('#link-title').type('Link 1');
    cy.get('#link-url').type('www.example.com');
    cy.getByTestId('menu-form-submit').click();

    cy.getByTestId('menu-add-link').click();
    cy.get('#link-title').click();
    cy.get('#link-title').type('Link 2');
    cy.get('#link-url').click();
    cy.get('#link-url').type('www.example.com');
    cy.getByTestId('menu-form-submit').click();

    cy.getByTestId('menu-add-link').click();
    cy.getByTestId('menu-form-cancel').click();

    cy.getByTestId('menu-add-link').click();
    cy.get('#link-title').click();
    cy.get('#link-title').type('Link 3');
    cy.get('#link-url').type('www.exmple.com');
    cy.getByTestId('menu-form-submit').click();

    cy.getByTestId('menu-save').click();
    cy.contains('Dismiss').click();
    cy.wait('@fetchLinks');
  });

  it('tests Add groups', () => {
    cy.getByTestId('menu-add-group').click();
    cy.get('#link-title').click();
    cy.get('#link-title').type('Group 1');
    cy.get("[data-testid='menu-form-submit'] > span").click();
    cy.getByTestId('menu-add-group').click();
    cy.get('#link-title').click();
    cy.get('#link-title').type('Group 2');
    cy.getByTestId('menu-form-submit').click();
    cy.getByTestId('menu-save').click();
    cy.contains('Dismiss').click();
    cy.wait('@fetchLinks');
  });

  it('tests Edit', () => {
    cy.getByTestId('group_0').contains('Edit').click();
    cy.get('#link-title').type(' edited');
    cy.get('#link-group').select('Group 1');
    cy.getByTestId('menu-form-submit').click();
    cy.get('td:nth-of-type(2) button span').click();
    cy.get("[data-testid='group_0'] button").click();
    cy.get('#link-group').select('Group 2');
    cy.getByTestId('menu-form-submit').click();
    cy.getByTestId('menu-save').click();
    cy.contains('Dismiss').click();
    cy.wait('@fetchLinks');
  });

  it('tests edit groups', () => {
    cy.getByTestId('group_1').contains('button', 'Group').click();
    cy.getByTestId('group_1.0').contains('Edit').click();
    cy.get('#link-group').select('Group 2');
    cy.getByTestId('menu-form-submit').click();

    cy.getByTestId('group_0').contains('Edit').click();
    cy.get('#link-group').select('Group 1');
    cy.getByTestId('menu-form-submit').click();

    cy.getByTestId('menu-save').click();
    cy.contains('Dismiss').click();
    cy.wait('@fetchLinks');
  });

  it('tests delete', () => {
    cy.get("[data-testid='group_1.1'] input").click();
    cy.getByTestId('menu-delete-link').click();

    cy.getByTestId('group_0').contains('button', 'Group').click();
    cy.get("[data-testid='group_0'] input").click();
    cy.getByTestId('menu-delete-link').click();

    cy.getByTestId('menu-save').click();
    cy.contains('Dismiss').click();
    cy.wait('@fetchLinks');
  });
});
