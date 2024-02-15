import { clearCookiesAndLogin } from '../helpers/login';

describe('Pages', () => {
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-fixtures', { env });
    clearCookiesAndLogin();
  });

  describe('Custom home page and styles', () => {
    it('should allow setting up a custom CSS', () => {
      cy.contains('a', 'Settings').click();
      cy.contains('a', 'Global CSS').click();
      cy.get('textarea[name="settings.settings.customCSS"]').type(
        '.myDiv { color: white; font-size: 20px; background-color: red; }',
        { parseSpecialCharSequences: false }
      );
      cy.contains('button', 'Save').click();
      cy.waitForNotification('Settings updated');
    });

    it('should create a page to be used as home', () => {
      cy.contains('a', 'Pages').click();
      cy.contains('Add page').click();
      cy.clearAndType('input[name="title"]', 'Custom home page');
      cy.contains('Code').click();
      cy.get('div[data-mode-id="html"]').type(
        '<h1>Custom HomePage header</h1><div class="myDiv">contents</div>',
        { parseSpecialCharSequences: false }
      );
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(501);
      cy.contains('button.bg-success-700', 'Save').click();
      cy.contains('Saved successfully');
      cy.get('input[id="page-url"]')
        .should('have.prop', 'value')
        .should('match', /\/page\/\w+\/custom-home-page$/g);
      cy.get('nav[aria-label="Breadcrumb"]').contains('Custom home page');
    });

    it('should allow setting the page as custom home page', () => {
      let pagePath: string;
      cy.get('input[id="page-url"]').then(path => {
        pagePath = path.val() as string;
        cy.contains('a', 'Collection').click();
        cy.get('input[id="landing-page"]').type(pagePath);
        cy.contains('button', 'Save').click();
        cy.waitForNotification('Settings updated');
      });
    });

    it('should render the custom page as home page with the custom CSS styles', () => {
      cy.visit('http://localhost:3000');
      cy.reload();
      cy.get('h1').contains('Custom HomePage header');
      cy.get('div.myDiv').should('have.css', 'color', 'rgb(255, 255, 255)');
      cy.get('div.myDiv').should('have.css', 'backgroundColor', 'rgb(255, 0, 0)');
      cy.get('div.myDiv').should('have.css', 'fontSize', '20px');
    });

    it('should allow settings a public entity as a landing page', () => {
      cy.contains('a', 'Settings').click();
      cy.contains('a', 'Collection').click();
      cy.clearAndType('input[id="landing-page"]', '/entity/7ycel666l65vobt9');
      cy.contains('button', 'Save').click();
      cy.waitForNotification('Settings updated');
    });

    it('should check that the landing page is the defined entity', () => {
      cy.visit('http://localhost:3000');
      cy.reload();

      cy.get('.content-header-title > .item-name').should(
        'have.text',
        'Corte Interamericana de Derechos Humanos'
      );
    });

    it('should allow using a complex library query as a landing page', () => {
      cy.contains('a', 'Settings').click();
      cy.contains('a', 'Collection').click();
      cy.clearAndType(
        'input[id="landing-page"]',
        '/en/library/?q=(allAggregations:!f,filters:(),from:0,includeUnpublished:!t,limit:30,order:desc,sort:creationDate,treatAs:number,types:!(%2758ada34c299e82674854504b%27),unpublished:!f)'
      );
      cy.contains('button', 'Save').click();
      cy.waitForNotification('Settings updated');
    });

    it('should check that the landing page is the defined library query', () => {
      cy.visit('http://localhost:3000');
      cy.reload();
      cy.contains('2 shown of 2 entities');
      cy.contains('Corte Interamericana de Derechos Humanos');
      cy.contains('Comisión Interamericana de Derechos Humanos');
    });

    it('should allow using a default library url with language as a landing page', () => {
      cy.contains('a', 'Settings').click();
      cy.contains('a', 'Collection').click();
      cy.clearAndType('input[id="landing-page"]', '/en/library/');
      cy.contains('button', 'Save').click();
      cy.waitForNotification('Settings updated');
      cy.visit('http://localhost:3000');
      cy.reload();
      cy.contains('30 shown of');
      cy.contains('Artavia Murillo y otros.');
    });
  });

  describe('Pages list', () => {
    it('should render a list with all pages names', () => {
      cy.contains('a', 'Settings').click();
      cy.contains('a', 'Pages').click();
      cy.get('[data-testid="settings-content"] [data-testid="table"]').toMatchImageSnapshot();
    });

    it('should allow to edit and get a preview of the page', () => {
      cy.contains('table > tbody > tr:nth-child(1) > td:nth-child(5)', 'Edit').click();
      cy.contains('View page').invoke('attr', 'target', '_self').click();
      cy.location('pathname', { timeout: 500 }).should('include', 'page-with-error');
      cy.contains('This content may not work correctly.');
      cy.on('uncaught:exception', (_err, _runnable) => {
        cy.contains('There is an unexpected error on this custom page');
        return false;
      });
    });
  });

  describe('Page edition', () => {
    it('should validate the title', () => {
      cy.visit('localhost:3000/en/settings/pages');
      cy.get('table > tbody > tr:nth-child(1) > td > label > input').check();
      cy.contains('Delete').click();
      cy.contains('Are you sure?');
      cy.contains('Accept').click();
      cy.waitForNotification('Deleted successfully');
    });
  });
});
