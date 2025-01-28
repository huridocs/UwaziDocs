import { Property } from '../Property';

describe('Property', () => {
  it('should create a Property instance and process name property if no name is provided', () => {
    const property = Property.create({
      id: '1',
      label: 'Any Label 123',
      templateId: 'any_template_id',
      type: 'text',
    });

    expect(property.name).toBe('any_label_123');
  });

  it('should create a Property instance and not process name if a name is provided', () => {
    const property = Property.create({
      id: '1',
      label: 'Any Label',
      name: 'any_label',
      templateId: 'any_template_id',
      type: 'text',
    });

    expect(property.name).toBe('any_label');
  });

  it('should instantiate a Property', () => {
    const property = new Property({
      id: '1',
      label: 'Any Label',
      name: 'any_label',
      templateId: 'any_template_id',
      type: 'text',
    });

    expect(property.id).toBe('1');
    expect(property.name).toBe('any_label');
    expect(property.type).toBe('text');
    expect(property.template).toBe('any_template_id');
    expect(property.label).toBe('Any Label');
    expect(property.isCommonProperty).toBe(false);
  });
});
