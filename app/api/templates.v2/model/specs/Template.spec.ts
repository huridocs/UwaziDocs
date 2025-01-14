import { Template } from '../Template';
import { creationDateCommonProperty, titleCommonProperty } from './fixtures';

describe('Template', () => {
  it('should throw an error if Title common property is undefined', () => {
    expect(
      () =>
        new Template({
          id: 'any_id',
          color: 'any_color',
          isDefault: false,
          name: 'any_name',
          properties: [],
        })
    ).toThrow(new Error('Title common property is required'));
  });

  it('should throw an error if Creation Date common property is undefined', () => {
    expect(
      () =>
        new Template({
          id: 'any_id',
          color: 'any_color',
          isDefault: false,
          name: 'any_name',
          properties: [titleCommonProperty],
        })
    ).toThrow(new Error('Creation date common property is required'));
  });

  it('should throw an error if Edit Date common property is undefined', () => {
    expect(
      () =>
        new Template({
          id: 'any_id',
          color: 'any_color',
          isDefault: false,
          name: 'any_name',
          properties: [titleCommonProperty, creationDateCommonProperty],
        })
    ).toThrow(new Error('Edit date common property is required'));
  });
});
