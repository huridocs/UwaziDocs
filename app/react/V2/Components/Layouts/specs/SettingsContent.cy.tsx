import React from 'react';
import { BrowserRouter } from 'react-router';
import 'cypress-axe';
import { mount } from '@cypress/react18';
import { SettingsContent } from '../SettingsContent';

describe('ConfirmationModal', () => {
  const render = () => {
    mount(
      <div className="tw-content">
        <BrowserRouter>
          <SettingsContent className="h-full">
            <SettingsContent.Header
              path={
                new Map([
                  ['Root Path', '#top'],
                  ['Middle Path', '#bottom'],
                  ['Leaf', '#footer'],
                ])
              }
              title="Current page"
            />
          </SettingsContent>
          <SettingsContent.Body>
            <span className="text-9xl">Body</span>
          </SettingsContent.Body>
          <SettingsContent.Footer>
            <span id="footer">Footer</span>
          </SettingsContent.Footer>
        </BrowserRouter>
      </div>
    );
  };

  it('should be accessible', () => {
    render();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should have the basic structure of settings content', () => {
    render();
    cy.get('[data-testid="settings-content-header"]')
      .invoke('text')
      .should('contain', 'Root PathMiddle PathLeafCurrent page');
    cy.get('a[href="/settings"]').should('not.be.visible');
    cy.contains('a', 'Root Path').invoke('attr', 'href').should('include', '#top');
    cy.contains('a', 'Middle Path').invoke('attr', 'href').should('include', '#bottom');
    cy.contains('a', 'Leaf').invoke('attr', 'href').should('include', '#footer');
    cy.contains('Current page').should('not.have.attr', 'href');
    cy.get('[data-testid="settings-content-body"]').should('have.class', 'flex-grow');
  });

  it('should have an arrow to return to settings menu for mobile', () => {
    cy.viewport(450, 650);
    render();
    cy.get('a[href="/settings"]').should('be.visible');
  });
});
