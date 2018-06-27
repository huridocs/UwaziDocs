import React from 'react';
import { shallow } from 'enzyme';
import Immutable from 'immutable';
import NestedMultiselect from '../NestedMultiselect';
import { MultiSelect } from '../../../ReactReduxForms';

describe('NestedMultiselect', () => {
  let component;
  let props;
  const aggregations = {
    nested_property: {
      acd: {
        buckets: [
          {
            key: '1',
            doc_count: 4,
            filtered: {
              doc_count: 2,
              total: { doc_count: 4, filtered: { doc_count: 2 } }
            }
          },
          {
            key: '1.1',
            doc_count: 3,
            filtered: {
              doc_count: 2,
              total: { doc_count: 3, filtered: { doc_count: 2 } }
            }
          }
        ]
      },
      cjh: {
        buckets: [
          {
            key: '2',
            doc_count: 4,
            filtered: {
              doc_count: 2,
              total: { doc_count: 4, filtered: { doc_count: 2 } }
            }
          },
          {
            key: '1.2',
            doc_count: 3,
            filtered: {
              doc_count: 2,
              total: { doc_count: 4, filtered: { doc_count: 2 } }
            }
          }
        ]
      },
      acb: {
        buckets: [
          {
            key: 'missing',
            doc_count: 3,
            filtered: {
              doc_count: 2,
              total: { doc_count: 4, filtered: { doc_count: 2 } }
            }
          }
        ]
      }
    }
  };

  beforeEach(() => {
    props = {
      label: 'input label',
      value: [],
      property: { name: 'nested_property', nestedProperties: ['acd', 'cjh', 'acb'] },
      onChange: jasmine.createSpy('onChange'),
      aggregations: Immutable.fromJS(aggregations)
    };
  });

  const render = () => {
    component = shallow(<NestedMultiselect {...props}/>);
  };

  it('should render the groups', () => {
    render();
    const optionElements = component.find(MultiSelect);

    expect(optionElements.length).toBe(2);
    expect(optionElements.first().props().model).toBe('.filters.nested_property.properties.acd.values');
    expect(optionElements.first().props().options).toEqual([{ label: '1', results: 2, value: '1' }, { label: '1.1', results: 2, value: '1.1' }]);

    expect(optionElements.last().props().model).toBe('.filters.nested_property.properties.cjh.values');
    expect(optionElements.first().props().options).toEqual([{ label: '1', results: 2, value: '1' }, { label: '1.1', results: 2, value: '1.1' }]);
  });
});
