const login = (username: string, password: string) => {
  cy.get('a[aria-label="Sign in"]').click();
  cy.get('input[name="username"').type(username);
  cy.get('input[name="password"').type(password);
  cy.get('button[type="submit"').click();
};

const logout = () => {
  cy.get('.only-desktop a[aria-label="Settings"]').click();
  cy.contains('a', 'Account').click();
  cy.get('.settings-footer a.btn').click();
};

const changeLanguage = () => {
  cy.get('.menuNav-language > .dropdown').click();
  cy.get('div[aria-label="Languages"]  li.menuNav-item:nth-child(2) a').click();
};

const englishLoggedInUwazi = (username = 'admin', password = 'admin') => {
  cy.visit('http://localhost:3000');
  changeLanguage();
  login(username, password);
  cy.get('.item-document').should('have.length.above', 3);
};

export { login, logout, englishLoggedInUwazi, changeLanguage };
