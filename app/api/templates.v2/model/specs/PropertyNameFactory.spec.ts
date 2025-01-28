import { PropertyNameFactory } from '../PropertyNameFactory';

describe('PropertyNameFactory', () => {
  it('should format value if generateRandomName is false', () => {
    const value = 'Some Value with spaces *&^%$@@!#/=';
    const generateRandomName = false;

    const propertyName = PropertyNameFactory.create({
      type: 'text',
      label: value,
      shouldGenerateRandomName: generateRandomName,
    });

    expect(propertyName).toEqual('some_value_with_spaces____________');
  });

  it('should generate random name if generateRandomName is true', () => {
    const value = 'Some Value with spaces';
    const generateRandomName = true;

    const propertyName = PropertyNameFactory.create({
      type: 'text',
      label: value,
      shouldGenerateRandomName: generateRandomName,
    });

    expect(propertyName).toEqual('some_value_with_spaces');
  });

  it('should append _geolocation after instantiation', () => {
    const value = 'Some Value';
    const generateRandomName = false;

    const propertyName = PropertyNameFactory.create({
      type: 'geolocation',
      label: value,
      shouldGenerateRandomName: generateRandomName,
    });

    expect(propertyName).toEqual('some_value_geolocation');
  });

  it('should append _nested after instantiation', () => {
    const value = 'Some Value';
    const generateRandomName = false;

    const propertyName = PropertyNameFactory.create({
      type: 'nested',
      label: value,
      shouldGenerateRandomName: generateRandomName,
    });

    expect(propertyName).toEqual('some_value_nested');
  });
});
