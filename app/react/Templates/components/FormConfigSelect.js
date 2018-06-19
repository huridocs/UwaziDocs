import { Field } from 'react-redux-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Select } from 'app/ReactReduxForms';
import { t } from 'app/I18N';
import FilterSuggestions from 'app/Templates/components/FilterSuggestions';
import ShowIf from 'app/App/ShowIf';
import { Icon } from 'UI';

export class FormConfigSelect extends Component {
  static contentValidation() {
    return { required: val => val.trim() !== '' };
  }

  render() {
    const { index, data, formState } = this.props;
    const thesauris = this.props.thesauris.toJS();
    const property = data.properties[index];

    const options = thesauris.filter(thesauri => thesauri._id !== data._id && thesauri.type !== 'template');

    let labelClass = 'form-group';
    const labelKey = `properties.${index}.label`;
    const requiredLabel = formState.$form.errors[`${labelKey}.required`];
    const duplicatedLabel = formState.$form.errors[`${labelKey}.duplicated`];
    const contentRequiredError = formState.$form.errors[`properties.${index}.content.required`] && formState.$form.submitFailed;
    if (requiredLabel || duplicatedLabel) {
      labelClass += ' has-error';
    }

    return (
      <div>
        <div className={labelClass}>
          <label>Label</label>
          <Field model={`template.data.properties[${index}].label`}>
            <input className="form-control"/>
          </Field>
        </div>

        <div className={contentRequiredError ? 'form-group has-error' : 'form-group'}>
          <label>{t('System', 'Select list')}<span className="required">*</span></label>
          <Select
            model={`template.data.properties[${index}].content`}
            options={options}
            optionsLabel="name"
            optionsValue="_id"
          />
        </div>

        <Field model={`template.data.properties[${index}].required`}>
          <input id={`required${this.props.index}`} type="checkbox"/>
          &nbsp;
          <label className="property-label" htmlFor={`required${this.props.index}`}>
            Required property
            <span className="property-help">
							<Icon icon="question-circle" />
              <div className="property-description">You won't be able to publish a document if this property is empty.</div>
            </span>
          </label>
        </Field>

        <Field model={`template.data.properties[${index}].showInCard`}>
          <input id={`showInCard${this.props.index}`} type="checkbox"/>
          &nbsp;
          <label className="property-label" htmlFor={`showInCard${this.props.index}`}>
            Show in cards
            <span className="property-help">
							<Icon icon="question-circle" />
              <div className="property-description">This property will appear in the library cards as part of the basic info.</div>
            </span>
          </label>
        </Field>

        <div>
          <Field className="filter" model={`template.data.properties[${index}].filter`}>
            <input id={`filter${this.props.index}`} type="checkbox"/>
            &nbsp;
            <label className="property-label" htmlFor={`filter${this.props.index}`}>
              Use as filter
              <span className="property-help">
								<Icon icon="question-circle" />
                <div className="property-description">
                  This property will be used for filtering the library results.
                  When properties match in equal name and field type with other document types, they will be combined for filtering.
                </div>
              </span>
            </label>
          </Field>
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

      </div>
    );
  }
}

FormConfigSelect.propTypes = {
  thesauris: PropTypes.object,
  data: PropTypes.object,
  index: PropTypes.number,
  formState: PropTypes.object,
  formKey: PropTypes.string
};

export function mapStateToProps(state) {
  return {
    data: state.template.data,
    thesauris: state.thesauris,
    formState: state.template.formState
  };
}

export default connect(mapStateToProps)(FormConfigSelect);
