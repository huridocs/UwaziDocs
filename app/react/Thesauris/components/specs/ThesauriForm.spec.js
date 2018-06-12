import React from 'react';
import { shallow } from 'enzyme';
import Immutable from 'immutable';

import { mapStateToProps, ThesauriForm } from 'app/Thesauris/components/ThesauriForm.js';

describe('ThesauriForm', () => {
  let props;
  let component;
  let instance;
  beforeEach(() => {
    props = {
      thesauri: {
        _id: '123',
        name: 'thesauri name',
        values: [
          { label: 'Heroes', values: [{ label: 'Batman' }, { label: 'Robin' }] },
          { label: 'Villains', values: [{ label: 'Joker' }, { label: 'Penguin' }] }
        ]
      },
      resetForm: jasmine.createSpy('resetForm'),
      setInitial: jasmine.createSpy('setInitial'),
      thesauris: Immutable.fromJS([{ name: 'Countries' }]),
      saveThesauri: jasmine.createSpy('saveThesauri'),
      addValue: jasmine.createSpy('addValue'),
      addGroup: jasmine.createSpy('addGroup'),
      sortValues: jasmine.createSpy('sortValues'),
      removeValue: jasmine.createSpy('removeValue'),
      moveValues: jasmine.createSpy('moveValues'),
      state: { fields: [], $form: {} }
    };
  });

  const render = () => {
    component = shallow(<ThesauriForm {...props}/>);
    instance = component.instance();
  };

  describe('when unmount', () => {
    it('shoould reset the form', () => {
      render();
      component.unmount();
      expect(props.resetForm).toHaveBeenCalled();
      expect(props.setInitial).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('should render groups and values', () => {
      render();
      const groups = component.find('.sub-group');
      expect(groups.length).toBe(2);
      const firstGroupValues = groups.first().find('input');
      const lastGroupValues = groups.last().find('input');
      expect(firstGroupValues.length).toBe(3);
      expect(lastGroupValues.length).toBe(3);
    });
  });

  describe('save()', () => {
    it('should sanitize the thesauri and save it', () => {
      render();
      const thesauri = {
        values: [
          { label: 'Heroes', values: [{ label: 'Batman' }, { label: 'Robin' }] },
          { label: '', values: [{ label: 'Joker' }, { label: 'Penguin' }] },
          { label: 'I have no values', values: [] },
          { label: '' }
        ]
      };
      instance.save(thesauri);
      const sanitizedThesauri = {
        values: [{ label: 'Heroes', values: [{ label: 'Batman' }, { label: 'Robin' }] }]
      };
      expect(props.saveThesauri).toHaveBeenCalledWith(sanitizedThesauri);
    });
  });

  describe('componentWillReceiveProps()', () => {
    it('should add an empty value at the end of the thesauri and at the end of groups when there is none', () => {
      instance.componentWillReceiveProps(props);
      expect(props.addValue.calls.allArgs()).toEqual([[0], [1], []]);
    });
  });

  describe('componentDidUpdate() when a group is added', () => {
    it('should focus it', () => {
      const previousProps = {
        thesauri: {
          _id: '123',
          name: 'thesauri name',
          values: [
            { label: 'Heroes', values: [{ label: 'Batman' }, { label: 'Robin' }] }
          ]
        }
      };
      instance.firstLoad = false;
      instance.groups = [
        { focus: jasmine.createSpy('focus') },
        { focus: jasmine.createSpy('focus') }
      ];
      instance.componentDidUpdate(previousProps);
      expect(instance.groups[1].focus).toHaveBeenCalled();
    });
  });

  describe('mapStateToProps', () => {
    let state;
    beforeEach(() => {
      state = {
        thesauri: {
          data: { name: 'thesauri name', values: [] },
          state: 'thesauri form state'
        },
        thesauris: Immutable.fromJS([{ name: 'Countries' }])
      };
    });

    it('should map the thesauri to initialValues', () => {
      expect(mapStateToProps(state).thesauri).toEqual({ name: 'thesauri name', values: [] });
      expect(mapStateToProps(state).thesauris).toEqual(Immutable.fromJS([{ name: 'Countries' }]));
    });
  });
});
