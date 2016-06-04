import React from 'react';
import {shallow} from 'enzyme';

import FormGroup from '../FormGroup';
import FormField from 'app/Forms/components/FormField';

describe('FormGroup', () => {
  let component;
  let props;

  beforeEach(() => {
    props = {};
  });

  let render = () => {
    component = shallow(<FormGroup {...props}><label>label</label><FormField><input /></FormField></FormGroup>);
  };

  it('should render the children', () => {
    render();
    let label = component.find('label');
    expect(label.length).toBe(1);
    let field = component.find(FormField);
    expect(field.length).toBe(1);
  });

  it('should render errors when touched and invalid', () => {
    props.touched = true;
    props.valid = false;
    render();
    let group = component.find('.form-group');
    expect(group.hasClass('has-error')).toBe(true);
  });

  it('should render errors when touched and submitFailed', () => {
    props.touched = false;
    props.submitFailed = true;
    props.valid = false;
    render();
    let group = component.find('.form-group');
    expect(group.hasClass('has-error')).toBe(true);
  });

  it('should not render errors when submitFailed with no errors', () => {
    props.submitFailed = true;
    render();
    let group = component.find('.form-group');
    expect(group.hasClass('has-error')).toBe(false);
  });
});
