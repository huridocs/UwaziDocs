import { login } from './helpers';

const changeLanguage = () => {
  cy.get('.menuNav-language > .dropdown').click();
  cy.get('div[aria-label="Languages"]  li.menuNav-item:nth-child(2) a').click();
};

const englishLoggedInUwazi = (username = 'admin', password = 'admin') => {
  cy.visit('http://localhost:3000');
  changeLanguage();
  login(username, password);
};

const createUser = (userDetails: {
  username: string;
  password: string;
  email: string;
  group: string;
}) => {
  cy.get('.only-desktop a[aria-label="Settings"]').click();
  cy.contains('a', 'Users').click();
  cy.contains('button', 'Add user').click();
  cy.get('aside').get('input[name=email]').clear().type(userDetails.email);
  cy.get('aside').get('input[name=username]').clear().type(userDetails.username);
  cy.get('aside').get('input[name=password]').clear().type(userDetails.password);
  cy.get('aside').contains('span', userDetails.group).click();
  cy.get('aside').contains('button', 'Save').click();
};

describe('Share Publicly', () => {
  const entityTitle =
    'Artavia Murillo y otros. Resolución del Presidente de la Corte de 6 de agosto de 2012';
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-puppeteer-fixtures', { env });
  });

  it('should create a colaborator in the shared User Group', () => {
    englishLoggedInUwazi();
    cy.get('a[aria-label="Library"]').click();
    createUser({
      username: 'colla',
      password: 'borator',
      email: 'rock@stone.com',
      group: 'Asesores legales',
    });
  });

  it('should share an entity with the collaborator', () => {
    englishLoggedInUwazi();

    // TODO: Should select published entities better
    cy.get('aside').contains('span', 'Restricted').click();
    cy.contains('h2', entityTitle).click();
    cy.contains('button', 'Share').click();
    cy.get('[data-testid=modal] input').type('colla');
    cy.get('ul[role=listbox]').contains('span', 'colla').click();
    cy.get('div[data-testid=modal] select').eq(2).select('write');
    cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    cy.contains('button', 'Save changes').click();
  });

  it('should unshare entities publicly', () => {
    englishLoggedInUwazi();

    // TODO: Should select published entities better
    cy.get('aside').contains('span', 'Restricted').click();
    cy.contains('h2', entityTitle).click();
    cy.contains('button', 'Share').click();
    cy.get('div[data-testid=modal] select').eq(1).select('delete');
    cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    cy.contains('button', 'Save changes').click();
  });

  describe('share entities publicly', () => {
    beforeEach(() => {
      englishLoggedInUwazi();
    });

    it('should share the entity', () => {
      // TODO: Should select restricted entities better
      cy.get('aside').contains('span', 'Restricted').click();
      cy.contains('h2', entityTitle).click();
      cy.contains('button', 'Share').click();
      cy.get('[data-testid=modal] input').focus();
      cy.get('ul[role=listbox]').contains('span', 'Public').click();
      cy.get('div[data-testid=modal]').toMatchImageSnapshot();
      cy.contains('button', 'Save changes').click();
    });

    it('should not display the entity among the restricted ones', () => {
      // TODO: Should select restricted entities better
      cy.get('aside').contains('span', 'Published').click();
      cy.contains('h2', entityTitle).should('not.exist');
    });
  });

  describe('as a collaborator', () => {
    it('should not be able to unshare entities publicly', () => {
      englishLoggedInUwazi('colla', 'borator');
      cy.contains('h2', entityTitle).click();
      cy.contains('button', 'Share').click();
      cy.get('div[data-testid=modal] select').eq(1).should('not.exist');
      cy.get('div[data-testid=modal]').toMatchImageSnapshot();
      cy.contains('button', 'Close').click();
      cy.get('aside button[aria-label="Close side panel"]').eq(1).click();
    });

    it('should create an entity', () => {
      englishLoggedInUwazi('colla', 'borator');
      cy.contains('button', 'Create entity').click();
      cy.get('aside textarea').type('Test title');
      cy.contains('button', 'Save').click();
      cy.contains('div.alert', 'Entity created').click();
      cy.get('main').toMatchImageSnapshot();
    });

    it('should not be able to share the entity', () => {
      englishLoggedInUwazi('colla', 'borator');
      // TODO: Should select restricted entities better
      cy.get('aside').contains('span', 'Published').click();
      cy.contains('h2', 'Test title').click();
      cy.contains('button', 'Share').click();
      cy.get('div[data-testid=modal] select').should('have.length', 2);
      cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    });

    it('should show mixed access', () => {
      englishLoggedInUwazi();
      cy.get('input[name="library.search.searchTerm"]').type('test 2016');
      cy.get('[aria-label="Search button"]').click();
      cy.get('.item-document').should('have.length', 3);
      cy.contains('button', 'Select all').click();
      cy.get('aside').should('be.visible');
      cy.get('aside button.share-btn').eq(1).click();
      cy.get('div[data-testid=modal]').toMatchImageSnapshot();
    });

    it('should keep publishing status if mixed access selected', () => {
      englishLoggedInUwazi();
      cy.get('input[name="library.search.searchTerm"]').type('test 2016');
      cy.get('[aria-label="Search button"]').click();
      cy.get('.item-document').should('have.length', 3);
      cy.contains('button', 'Select all').click();
      cy.get('aside').should('be.visible');
      cy.get('aside button.share-btn').eq(1).click();
      cy.get('div[data-testid=modal] select').eq(1).select('read');
      cy.contains('button', 'Save changes').click();
      cy.get('.item-document').should('have.length', 3);
      cy.get('.item-document').eq(0).toMatchImageSnapshot();
    });
  });
});
