/**
 * @jest-environment jsdom
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { defaultState, renderConnectedContainer } from 'app/utils/test/renderConnected';
import UsersAPI from 'app/Users/UsersAPI';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  const render = () => {
    const store = {
      ...defaultState,
    };
    renderConnectedContainer(<Dashboard />, () => store);
  };

  describe('Users report', () => {
    it('should display the total number of users', async () => {
      jest.spyOn(UsersAPI, 'get').mockResolvedValueOnce([
        {
          username: 'admin',
          role: 'admin',
        },
      ]);

      render();

      expect((await screen.findByText('Total users')).parentElement?.textContent).toBe(
        '1 Total users'
      );
    });

    it('should show a breakdown of user types', async () => {
      jest.spyOn(UsersAPI, 'get').mockResolvedValueOnce([
        {
          username: 'admin',
          role: 'admin',
        },
        {
          username: 'editor 1',
          role: 'editor',
        },
        {
          username: 'editor 2',
          role: 'editor',
        },
      ]);

      render();

      expect((await screen.findByText('Total users')).parentElement?.textContent).toBe(
        '3 Total users'
      );

      expect((await screen.findByText('Admin')).parentElement?.textContent).toBe('1 Admin');
      expect((await screen.findByText('Editor')).parentElement?.textContent).toBe('2 Editor');
      expect(screen.queryByText('Collaborator')).not.toBeInTheDocument();
    });
  });

  describe('Files report', () => {
    it('should show the total number of files', async () => {
      render();

      expect((await screen.findByText('Total files')).parentElement?.textContent).toBe(
        '2500 Total files'
      );
    });
  });

  describe('Entities report', () => {
    it('should show the total number of files', async () => {
      render();

      expect((await screen.findByText('Total entities')).parentElement?.textContent).toBe(
        '56327 Total entities'
      );
    });
  });

  describe('Storage report', () => {
    it('should show the amount of store used out of the total', async () => {
      render();

      expect((await screen.findByText('8 GB')).parentElement?.textContent).toBe('5.32 GB 8 GB');
    });
  });
});
