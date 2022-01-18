import testingDB from 'api/utils/testing_db';
import { migration } from '../index.js';
import fixtures from './fixtures.js';

describe('migration missing_languages', () => {
  beforeAll(async () => {
    // spyOn(process.stdout, 'write');
    await testingDB.clearAllAndLoad(fixtures);
    await migration.up(testingDB);
  });

  afterAll(async () => {
    await testingDB.tearDown();
  });

  it('should have a delta number', () => {
    expect(migration.delta).toBe(59);
  });

  it('should create new entities to fill missing languages', async () => {
    fail();
  });

  it('should copy root data', async () => {
    fail();
  });

  it('should copy properties that are not translated, or are not translatable without user input', async () => {
    fail();
  });

  it('should translate thesauri related (select, multiselect) properties', async () => {
    fail();
  });

  it('should make inherited values inherit from the entity in the proper language', async () => {
    fail();
  });
});
