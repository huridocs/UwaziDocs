import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FilterSuggestions from 'app/Templates/components/FilterSuggestions';
import { Field } from 'react-redux-form';
import { connect } from 'react-redux';
import ShowIf from 'app/App/ShowIf';
import PrioritySortingLabel from './PrioritySortingLabel';
import { Icon } from 'UI';

export class FormConfigInput extends Component {
  render() {
    const { index, property, formState, type } = this.props;
    let labelClass = 'form-group';
    const labelKey = `properties.${index}.label`;
    const requiredLabel = formState.$form.errors[`${labelKey}.required`];
    const duplicatedLabel = formState.$form.errors[`${labelKey}.duplicated`];
    if (requiredLabel || duplicatedLabel) {
      labelClass += ' has-error';
    }

    return (
      <div>

        <div className={labelClass}>
          <label>Name</label>
          <Field model={`template.data.properties[${index}].label`}>
            <input className="form-control" />
          </Field>
        </div>

        <Field model={`template.data.properties[${index}].required`}>
          <input id={`required${index}`} type="checkbox"/>
          &nbsp;
          <label className="property-label" htmlFor={`required${index}`}>
            Required property
            <span className="property-help">
              <Icon icon="question-circle" />
              <div className="property-description">You won&#8217;t be able to publish a document if this property is empty.</div>
            </span>
          </label>
        </Field>
        <ShowIf if={this.props.canShowInCard}>
          <Field model={`template.data.properties[${index}].showInCard`}>
            <input id={`showInCard${this.props.index}`} type="checkbox"/>
            &nbsp;
            <label className="property-label" htmlFor={`showInCard${this.props.index}`}>
              Show in cards
              <span className="property-help">
                <Icon icon="question-circle" />
                <div className="property-description">Show this property in the cards as part of the basic info.</div>
              </span>
            </label>
          </Field>
        </ShowIf>
        <ShowIf if={this.props.canPreview}>
          <Field className="filter" model={`template.data.properties[${index}].preview`}>
            <input id={`preview${this.props.index}`} type="checkbox"/>
            &nbsp;
            <label className="property-label" htmlFor={`preview${this.props.index}`}>
              Show as preview
              <span className="property-help">
                <Icon icon="question-circle" />
                <div className="property-description">This property will be shown at the top of the card.
                Only one property will be shown as preview.
                </div>
              </span>
            </label>
          </Field>
        </ShowIf>
        <div>
          <ShowIf if={this.props.canBeFilter}>
            <Field className="filter" model={`template.data.properties[${index}].filter`}>
              <input id={`filter${this.props.index}`} type="checkbox"/>
            &nbsp;
              <label className="property-label" htmlFor={`filter${this.props.index}`}>
              Use as filter
                <span className="property-help">
                  <Icon icon="question-circle" />
                  <div className="property-description">
                  Use this property to filter the library results.
                  When properties match in equal name and field type with other document types, they will be combined for filtering.
                  Also library items will be able to be sorted by this property.
                  </div>
                </span>
              </label>
            </Field>
          </ShowIf>
          <ShowIf if={property.filter}>
            <Field className="filter" model={`template.data.properties[${index}].defaultfilter`}>
              <input
                id={`defaultfilter${this.props.index}`}
                type="checkbox"
                disabled={!property.filter}
              />
              &nbsp;
              <label className="property-label" htmlFor={`defaultfilter${this.props.index}`}>
                Default filter
                <span className="property-help">
                  <Icon icon="question-circle" />
                  <div className="property-description">
                    Use this property as a default filter in the library.
                    When there are no document types selected, this property will show as a default filter for your collection.
                  </div>
                </span>
              </label>
            </Field>
          </ShowIf>
          <FilterSuggestions {...property} />
        </div>

        <ShowIf if={type === 'text' || type === 'date'}>
          <Field model={`template.data.properties[${index}].prioritySorting`}>
            <input id={`prioritySorting${this.props.index}`} type="checkbox" disabled={!property.filter} />
            &nbsp;
            <PrioritySortingLabel htmlFor={`prioritySorting${this.props.index}`} />
          </Field>
        </ShowIf>
      </div>
    );
  }
}

FormConfigInput.defaultProps = {
  canBeFilter: true,
  canShowInCard: true,
  canPreview: false
};

FormConfigInput.propTypes = {
  canBeFilter: PropTypes.bool,
  canPreview: PropTypes.bool,
  canShowInCard: PropTypes.bool,
  property: PropTypes.instanceOf(Object).isRequired,
  index: PropTypes.number.isRequired,
  formState: PropTypes.instanceOf(Object).isRequired,
  type: PropTypes.string.isRequired
};

export function mapStateToProps({ template }, props) {
  return {
    property: template.data.properties[props.index],
    formState: template.formState
  };
}

export default connect(mapStateToProps)(FormConfigInput);
