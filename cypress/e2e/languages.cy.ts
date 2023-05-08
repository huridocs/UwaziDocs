import { clearCookiesAndLogin } from './helpers/login';
import 'cypress-axe';

describe('Languages', () => {
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-puppeteer-fixtures', { env });
    clearCookiesAndLogin();
    cy.get('.only-desktop a[aria-label="Settings"]').click();
    cy.contains('span', 'Languages').click();
    cy.injectAxe();
  });

  describe('Languages List', () => {
    it('should render the list of installed languages', () => {
      cy.get('[data-testid=settings-languages]').toMatchImageSnapshot();
      cy.checkA11y();
      cy.contains('Arabic');
      cy.contains('English');
      cy.contains('Spanish');
    });
  });

  describe('Install Language', () => {
    it('should open the install language modal', () => {
      cy.contains('Install language').click();
      cy.checkA11y();
    });

    it('should install new languages', () => {
      cy.intercept('POST', 'api/translations/languages').as('addLanguage');
      cy.get('[data-testid=modal] input').type('Dansk');
      cy.contains('button', 'Dansk').click();

      cy.get('[data-testid=modal] input').clear();
      cy.get('[data-testid=modal] input').type('Esperanto');
      cy.contains('button', 'Esperanto').click();

      cy.contains('[data-testid=modal] button', 'Install').click();

      cy.wait('@addLanguage');
      cy.contains('Dansk');
      cy.contains('Esperanto');
    });
  });

  describe('Uninstall Language', () => {
    it('should uninstall the language and remove it from the list', () => {
      cy.intercept('DELETE', 'api/translations/languages*').as('deleteLanguage');
      cy.contains('tr', 'Esperanto').contains('Uninstall').click();
      cy.get('[data-testid=modal] input').type('CONFIRM');
      cy.contains('[data-testid=modal] button', 'Uninstall').click();

      cy.wait('@deleteLanguage');
      cy.contains('Esperanto').should('not.exist');
    });
  });

  describe('Set as default', () => {
    it('should set the language as default', () => {
      cy.intercept('POST', 'api/translations/setasdeafult').as('setDefault');
      cy.contains('tr', 'Spanish').contains('button', 'Default').click();
      cy.wait('@setDefault');
      cy.contains('tr', 'Spanish').contains('Uninstall').should('not.exist');
    });
  });

  describe('Reset Language', () => {
    it('should change a spanish translation', () => {
      cy.intercept('POST', 'api/translations').as('saveTranslation');
      cy.contains('span', 'Translations').click();
      cy.contains('tr', 'User Interface').contains('button', 'Translate').click();
      cy.contains('table', '(view page)').contains('tr', 'Español').find('input').clear();
      cy.contains('table', '(view page)').contains('tr', 'Español').find('input').type('test');
      cy.contains('button', 'Save').click();
      cy.contains('Translations saved');
    });

    it('should reset the spanish language', () => {
      cy.intercept('POST', 'api/translations/populate').as('resetLanguage');
      cy.contains('a span', 'Languages').click();
      cy.contains('tr', 'Spanish').contains('button', 'Reset').click();
      cy.get('[data-testid=modal] input').type('CONFIRM');
      cy.contains('[data-testid=modal] button', 'Reset').click();
      cy.wait('@resetLanguage');
    });

    it('should reset the spanish translation', () => {
      cy.contains('span', 'Translations').click();
      cy.contains('tr', 'User Interface').contains('button', 'Translate').click();
      cy.contains('table', '(view page)')
        .contains('tr', 'Español')
        .find('input')
        .should('have.value', '(ver página)');
    });
  });
});
