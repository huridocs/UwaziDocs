/** @format */
import { testingEnvironment } from 'api/utils/testingEnvironment';

import thesauri from 'api/thesauri';

import { fixtures, thesauri1Id } from '../../specs/fixtures';
import typeParsers from '../../typeParsers';

const rawEntityWithSelectValue = val => ({
  propertiesFromColumns: {
    select_prop: val,
  },
});

describe('select', () => {
  beforeEach(async () => testingEnvironment.setUp(fixtures));
  afterAll(async () => testingEnvironment.tearDown());

  it('should find thesauri value and return the id and value', async () => {
    const templateProp = { name: 'select_prop', content: thesauri1Id };

    const value1 = await typeParsers.select(rawEntityWithSelectValue('value1'), templateProp);
    const value2 = await typeParsers.select(rawEntityWithSelectValue('vAlUe2'), templateProp);
    const thesauri1 = await thesauri.getById(thesauri1Id);

    expect(value1).toEqual([{ value: thesauri1.values[0].id, label: 'value1' }]);
    expect(value2).toEqual([{ value: thesauri1.values[1].id, label: 'value2' }]);
  });

  it('should return null on blank values', async () => {
    const templateProp = { name: 'select_prop', content: thesauri1Id };
    const rawEntity = rawEntityWithSelectValue('');

    const value = await typeParsers.select(rawEntity, templateProp);

    expect(value).toBe(null);
  });
});
