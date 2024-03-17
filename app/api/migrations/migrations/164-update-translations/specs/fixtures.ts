import db from 'api/utils/testing_db';
import { Fixture } from '../types';

const fixtures: Fixture = {
  settings: [{ _id: db.id(), languages: [{ key: 'en' }, { key: 'es' }] }],
  translationsV2: [
    {
      _id: db.id(),
      language: 'en',
      context: { id: 'System', label: 'User Interface', type: 'Uwazi UI' },
      key: 'You are about to delete a page',
      value: 'You are about to delete a page',
    },
    {
      _id: db.id(),
      language: 'es',
      context: { id: 'System', label: 'User Interface', type: 'Uwazi UI' },
      key: 'You are about to delete a page',
      value: 'You are about to delete a page',
    },
    {
      _id: db.id(),
      language: 'en',
      context: { id: 'System', label: 'User Interface', type: 'Uwazi UI' },
      key: 'Im cool',
      value: 'Im cool',
    },
    {
      _id: db.id(),
      language: 'es',
      context: { id: 'System', label: 'User Interface', type: 'Uwazi UI' },
      key: 'Im cool',
      value: 'Im cool',
    },
  ],
};

export { fixtures };
