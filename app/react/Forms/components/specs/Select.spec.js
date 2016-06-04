import React from 'react';
import {shallow} from 'enzyme';

import Select from '../Select';

describe('Select', () => {
  let component;
  let props;

  beforeEach(() => {
    props = {
      label: 'input label',
      options: [{label: 'Option1', value: 'option1'}, {label: 'Option2', value: 'option2'}]
    };
  });

  let render = () => {
    component = shallow(<Select {...props}/>);
  };

  it('should render select with properties passed', () => {
    props.value = 'test';
    render();
    let select = component.find('select');

    expect(select.props().value).toBe('test');
  });

  it('should render the options', () => {
    render();
    let optionElements = component.find('option');

    expect(optionElements.length).toBe(2);
    expect(optionElements.first().props().value).toBe('option1');
    expect(optionElements.first().text()).toBe('Option1');
    expect(optionElements.last().props().value).toBe('option2');
    expect(optionElements.last().text()).toBe('Option2');
  });

  describe('different key name for label and value', () => {
    beforeEach(() => {
      props = {
        label: 'input label',
        options: [{name: 'Option1', id: 'option1'}, {name: 'Option2', id: 'option2'}],
        optionsValue: 'id',
        optionsLabel: 'name'
      };
      component = shallow(<Select {...props}/>);
    });

    it('should render the options', () => {
      let optionElements = component.find('option');

      expect(optionElements.length).toBe(2);
      expect(optionElements.first().props().value).toBe('option1');
      expect(optionElements.first().text()).toBe('Option1');
      expect(optionElements.last().props().value).toBe('option2');
      expect(optionElements.last().text()).toBe('Option2');
    });
  });
});
