import { selectPublishedEntities, selectRestrictedEntities, createUser } from './helpers';
import { englishLoggedInUwazi } from './helpers/login';

describe('Share Entities', () => {
  const titleEntity1 =
    'Resolución de la Corte IDH. Supervisión de cumplimiento de Sentencia de 29 de junio de 2005';
  const titleEntity2 = 'Applicability of Article 65 of the American Convention on Human Rights';
  const titleEntity3 = 'Article 65 of the American Convention on Human Rights';
  const titleEntity4 = 'Aitken';
  const titlePublic1 = 'Artavia Murillo y otros. Resolución de la Corte IDH de 31 de marzo de 2014';

  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-puppeteer-fixtures', { env });
  });

  it('should create a collaborator in the shared User Group', () => {
    englishLoggedInUwazi();
    createUser({
      username: 'colla',
      password: 'borator',
      email: 'rock@stone.com',
      group: 'Asesores legales',
    });
  });

  // eslint-disable-next-line max-statements
  it('Should list available collaborators of an entity', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.contains('h2', titleEntity1).click();
    cy.contains('button', 'Share').should('be.visible').click();
    cy.get('[data-testid=modal] input').focus();
    cy.get('div[data-testid=modal] [role=listbox]').toMatchImageSnapshot();
  });

  it('Should update the permissions of an entity', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.contains('h2', titleEntity1).click();
    cy.contains('button', 'Share').should('be.visible').click();
    cy.get('[data-testid=modal] input').type('editor');
    cy.get('ul[role=listbox]').contains('span', 'editor').click();
    cy.get('[data-testid=modal] input').clear().type('Ase');
    cy.get('ul[role=listbox]').contains('span', 'Asesores legales').click();
    cy.get('div[data-testid=modal] select').eq(1).select('write');
    cy.get('[data-testid=modal]').toMatchImageSnapshot();
    cy.get('[data-testid=modal]').contains('button', 'Save changes').click();
  });

  it('Should not keep previous entity data', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.contains('h2', titleEntity2).click();
    cy.contains('button', 'Share').should('be.visible').click();
    cy.get('.members-list').toMatchImageSnapshot();
  });

  it('Should open the share modal for multiple selection', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.get('.item').should('have.length', 5);
    cy.contains('button', 'Select all').click();
    cy.get('aside.is-active').contains('button', 'Share').should('be.visible').click();
    cy.get('table.members-list tbody tr').should('have.length', 3);
    cy.get('.members-list').toMatchImageSnapshot();
  });

  it('should share other entities with the collaborator', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.contains('h2', titleEntity3).click();
    cy.get('aside.is-active').contains('button', 'Share').should('be.visible').click();
    cy.get('[data-testid=modal] input').type('colla');
    cy.get('ul[role=listbox]').contains('span', 'colla').click();
    cy.get('div[data-testid=modal] select').eq(1).select('write');
    cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    cy.get('[data-testid=modal]').contains('button', 'Save changes').click();
  });

  it('should share other entities with the collaborator via the group', () => {
    englishLoggedInUwazi();
    selectRestrictedEntities();
    cy.contains('h2', titleEntity4).click();
    cy.get('aside.is-active').contains('button', 'Share').should('be.visible').click();
    cy.get('[data-testid=modal] input').type('Ase');
    cy.get('ul[role=listbox]').contains('span', 'Asesores legales').click();
    cy.get('div[data-testid=modal] select').eq(1).select('write');
    cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    cy.get('[data-testid=modal]').contains('button', 'Save changes').click();
  });

  const checkCanEdit = (title: string, canEdit: boolean = true) => {
    cy.contains('h2', title).click();
    if (canEdit) {
      cy.get('aside.is-active').contains('button', 'Edit').should('exist');
    } else {
      cy.get('aside.is-active').contains('button', 'Edit').should('not.exist');
    }
  };

  it('should be able to see and edit entities as a collaborator', () => {
    englishLoggedInUwazi('colla', 'borator');
    selectRestrictedEntities();
    cy.get('.item').should('have.length', 3);
    checkCanEdit(titleEntity1, false);
    checkCanEdit(titleEntity3);
    checkCanEdit(titleEntity4);
  });

  it('should be able to edit a save', () => {
    englishLoggedInUwazi('colla', 'borator');
    selectRestrictedEntities();
    cy.contains('h2', titleEntity4).click();
    cy.get('aside.is-active').contains('button', 'Edit').click();
    cy.get('aside.is-active textarea').eq(0).clear().type('Edited title');
    cy.get('aside.is-active').contains('button', 'Save').click();
    cy.get('div.alert').click();
    cy.contains('h2', 'Edited title').should('exist');
  });

  it('should be able to see only published entities', () => {
    englishLoggedInUwazi('colla', 'borator');
    selectPublishedEntities();
    cy.get('.search-box input').type('"Resolución de la Corte IDH."');
    cy.get('[aria-label="Search button"]').click();
    cy.get('.item-document').should('have.length', 1);
  });
});
