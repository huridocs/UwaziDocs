import React from 'react';
import { mount } from '@cypress/react18';
import { composeStories } from '@storybook/testing-react';
import * as stories from 'app/stories/ConfirmationModal.stories';

const { BasicConfirmation, TextConfirmation, WarningConfirmation } = composeStories(stories);

describe('ConfirmationModal', () => {
  it('should show a simple confirmation', () => {
    mount(<BasicConfirmation />);
    cy.contains('Delete Confirmation').should('be.visible');
    cy.contains('Are you sure you want to delete this product?').should('be.visible');
    cy.contains('Please type').should('not.exist');
  });

  it('should check confirmation text to accept action', () => {
    mount(<TextConfirmation />);
    cy.contains('Delete Confirmation').should('be.visible');
    cy.contains('Are you sure you want to delete this product?').should('be.visible');
    cy.contains('Please type in CONFIRMATION_TEXT:').should('be.visible');

    cy.contains('Yes').should('be.disabled');
    cy.get('[data-testid="confirm-input"]').type('CONFIRMATION_');
    cy.contains('Yes').should('be.disabled');
    cy.get('[data-testid="confirm-input"]').type('TEXT');
    cy.contains('Yes').should('not.be.disabled');
  });

  it('should show a warning', () => {
    mount(<WarningConfirmation />);
    cy.contains('Are you sure').should('be.visible');
    cy.contains('Other users will be affected by this action').should('be.visible');
  });
});
