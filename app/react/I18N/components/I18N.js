import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

class I18NComponent extends Component {
  render() {
    const dictionary = this.props.dictionaries.toJS().find(d => d.locale === this.props.locale) || {
      values: {},
    };
    let text = this.props.children;
    text = dictionary.values[text] || text;
    return <span>{text}</span>;
  }
}

I18NComponent.propTypes = {
  children: PropTypes.string,
  locale: PropTypes.string,
  dictionaries: PropTypes.object,
};

const mapStateToProps = ({ locale, dictionaries }) => ({ locale, dictionaries });

export const I18N = connect(mapStateToProps)(I18NComponent);
