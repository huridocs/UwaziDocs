import 'cypress-axe';
import { clearCookiesAndLogin } from './helpers';

const namesShouldMatch = (names: string[]) => {
  cy.get('table tbody tr').each((row, index) => {
    cy.wrap(row).within(() => {
      cy.get('td').eq(1).should('contain.text', names[index]);
    });
  });
};

describe('Users and groups', () => {
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-puppeteer-fixtures', { env });
    clearCookiesAndLogin();
    cy.get('.only-desktop a[aria-label="Settings"]').click();
    cy.contains('span', 'Users & Groups').click();
    cy.injectAxe();
  });

  describe('Users', () => {
    it('should be sorted by name by default', () => {
      const titles = ['admin', 'colla', 'editor'];
      namesShouldMatch(titles);
    });
    it('create user', () => {
      cy.contains('button', 'Add user').click();
      cy.get('aside').within(() => {
        cy.get('#username').type('User_1');
        cy.get('#email').type('user@mailer.com');
        cy.get('#password').type('secret');
        cy.get('[data-testid="multiselect-comp"]').within(() => {
          cy.get('button').click();
          cy.get('ul li')
            .eq(0)
            .within(() => {
              cy.get('input').eq(0).click();
            });
        });
        cy.contains('button', 'Save').click();
      });
      cy.contains('span', 'Account').click();
      cy.contains('span', 'Users & Groups').click();

      cy.contains('button', 'Dismiss').click();
      namesShouldMatch(['User_1', 'admin', 'colla', 'editor']);
    });
    it('edit user', () => {
      cy.intercept('POST', 'api/users').as('editUser');
      cy.get('table tbody tr')
        .eq(0)
        .within(() => {
          cy.get('td:nth-child(6) button').click();
        });
      cy.get('aside').within(() => {
        cy.get('#username').should('have.value', 'User_1');
        cy.get('#email').should('have.value', 'user@mailer.com');
        cy.get('#username').type('_edited');
        cy.get('#password').type('secret');
        cy.contains('button', 'Save').click();
      });
      cy.wait('@editUser');
      cy.contains('button', 'Dismiss').click();
      const titles = ['User_1_edited', 'admi', 'colla', 'editor'];
      namesShouldMatch(titles);
    });
    it('delete user', () => {
      cy.get('table tbody tr')
        .eq(0)
        .within(() => {
          cy.get('td input').eq(0).click();
        });
      cy.contains('button', 'Delete').click();
      cy.contains('[data-testid="modal"] button', 'Delete').click();
      cy.contains('button', 'Dismiss').click();
    });
    it('reset password', () => {
      cy.get('table tbody tr')
        .eq(0)
        .within(() => {
          cy.get('td input').eq(0).click();
        });
      cy.contains('button', 'Reset password').click();
    });
    it('disable 2fa', () => {
      cy.get('table tbody tr')
        .eq(0)
        .within(() => {
          cy.get('td input').eq(0).click();
        });
      cy.contains('button', 'Reset 2FA').click();
    });
    it('check for unique name and email');

    describe('bulk actions', () => {
      it('bulk delete');
      it('bulk password reset');
      it('bulk reset 2FA');
    });
  });

  describe('Groups', () => {
    before(() => {
      cy.contains('[data-testid="tabs-comp"] button', 'Groups').click();
    });
    it('should be sorted by name by default', () => {
      const groups = ['Activistas', 'Asesores legales'];
      namesShouldMatch(groups);
    });
    it('create group', () => {
      cy.contains('button', 'Add group').click();
      cy.get('aside').within(() => {
        cy.get('#name').type('Group_1');
        cy.get('[data-testid="multiselect-comp"]').within(() => {
          cy.get('button').click();
          cy.get('ul li')
            .eq(0)
            .within(() => {
              cy.get('input').eq(0).click();
            });
        });
        cy.contains('button', 'Save').click();
        cy.get('[data-testid="Close sidepanel"]').click();
      });
      // ----- remove below after implementing form submission ------
      cy.contains('[role="dialog"] button', 'Discard changes').click();

      // ----- the lines below should be edited after implementing form submission -----
      const titles = ['Activistas', 'Asesores legales', 'Group_1'];
      namesShouldMatch(titles);
    });
    it('edit group');
    it('delete group');
    it('check for unique name');
  });
});
