import React from 'react';
import {shallow} from 'enzyme';
import Immutable from 'immutable';

import {FormConfigRelationship} from 'app/Templates/components/FormConfigRelationship';
import {Field} from 'react-redux-form';
import {Select} from 'app/ReactReduxForms';

describe('FormConfigRelationship', () => {
  let component;
  let thesauris;
  let relationTypes;
  let props;

  beforeEach(() => {
    thesauris = [{_id: 1, name: 'thesauri1'}, {_id: 2, name: 'thesauri2'}, {_id: 3, name: 'Judge', type: 'template'}];
    relationTypes = [{_id: 1, name: 'relationType1'}, {_id: 2, name: 'relationType2'}];
    props = {
      thesauris: Immutable.fromJS(thesauris),
      relationTypes: Immutable.fromJS(relationTypes),
      index: 0,
      data: {properties: []},
      formState: {
        'properties.0.label': {valid: true, dirty: false, errors: {}},
        $form: {
          errors: {
            'properties.0.label.required': false,
            'properties.0.label.duplicated': false
          }
        }
      }
    };
  });

  it('should render fields with the correct datas', () => {
    component = shallow(<FormConfigRelationship {...props}/>);
    const formFields = component.find(Field);
    expect(formFields.nodes[0].props.model).toBe('template.data.properties[0].label');
    expect(formFields.nodes[1].props.model).toBe('template.data.properties[0].required');
    expect(formFields.nodes[2].props.model).toBe('template.data.properties[0].showInCard');
    expect(formFields.nodes[3].props.model).toBe('template.data.properties[0].filter');

    expect(component.find(Select).at(0).props().model).toBe('template.data.properties[0].content');
    expect(component.find(Select).at(1).props().model).toBe('template.data.properties[0].relationType');
  });

  it('should render the content select with the entities', () => {
    component = shallow(<FormConfigRelationship {...props}/>);
    let expectedOptions = [thesauris[2]];
    expect(component.find(Select).at(0).props().options).toEqual(expectedOptions);
  });

  it('should render the relationType select with the relationTypes', () => {
    component = shallow(<FormConfigRelationship {...props}/>);
    expect(component.find(Select).at(1).props().options).toEqual(relationTypes);
  });

  describe('validation', () => {
    it('should render the label without errors', () => {
      component = shallow(<FormConfigRelationship {...props}/>);
      expect(component.find('.has-error').length).toBe(0);
    });
  });

  describe('when the fields are invalid and dirty or the form is submited', () => {
    it('should render the label with errors', () => {
      props.formState.$form.errors['properties.0.label.required'] = true;
      props.formState['properties.0.label'].touched = true;
      component = shallow(<FormConfigRelationship {...props}/>);
      expect(component.find('.has-error').length).toBe(1);
    });

    it('should render the label with errors', () => {
      props.formState.$form.errors['properties.0.label.required'] = true;
      props.formState.submitFailed = true;
      component = shallow(<FormConfigRelationship {...props}/>);
      expect(component.find('.has-error').length).toBe(1);
    });
  });
});
