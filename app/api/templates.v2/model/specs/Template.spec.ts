import { Template } from '../Template';
import {
  creationDateCommonProperty,
  editDateCommonProperty,
  property,
  titleCommonProperty,
} from './fixtures';

describe('Template', () => {
  it('should create a Template', () => {
    const template = new Template({
      id: 'any_id',
      color: 'any_color',
      isDefault: false,
      name: 'any_name',
      properties: [
        titleCommonProperty,
        creationDateCommonProperty,
        editDateCommonProperty,
        property,
      ],
    });

    expect(template.id).toBe('any_id');
    expect(template.color).toBe('any_color');
    expect(template.isDefault).toBe(false);
    expect(template.name).toBe('any_name');
    expect(template.properties).toEqual([
      titleCommonProperty,
      creationDateCommonProperty,
      editDateCommonProperty,
      property,
    ]);
  });

  it('should only return common properties', () => {
    const template = new Template({
      id: 'any_id',
      color: 'any_color',
      isDefault: false,
      name: 'any_name',
      properties: [titleCommonProperty, creationDateCommonProperty, editDateCommonProperty],
    });

    expect(template.getCommonProperties()).toEqual([
      titleCommonProperty,
      creationDateCommonProperty,
      editDateCommonProperty,
    ]);
  });

  it('should only return non common properties', () => {
    const template = new Template({
      id: 'any_id',
      color: 'any_color',
      isDefault: false,
      name: 'any_name',
      properties: [
        titleCommonProperty,
        creationDateCommonProperty,
        editDateCommonProperty,
        property,
      ],
    });

    expect(template.getProperties()).toEqual([property]);
  });

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
