import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DatePicker from './DatePicker';
import { t } from 'app/I18N';

export default class DateRange extends Component {
  constructor(props) {
    super(props);
    const value = props.value || {};
    this.state = { from: value.from, to: value.to };
  }

  onChange(prop, value) {
    const state = Object.assign({}, this.state);
    state[prop] = value;
    this.setState(state);
    this.props.onChange(state);
  }

  render() {
    return (
      <div>
        <div className="DatePicker__From">
          <span>{t('System', 'Label date From', 'From: ')}&nbsp;</span>
          <DatePicker
            locale={this.props.locale}
            format={this.props.format}
            value={this.state.from}
            onChange={val => this.onChange('from', val)}
          />
        </div>
        <div className="DatePicker__To">
          <span>&nbsp;{t('System', 'Label date to', 'To: ')}&nbsp;</span>
          <DatePicker
            locale={this.props.locale}
            format={this.props.format}
            value={this.state.to}
            onChange={val => this.onChange('to', val)}
          />
        </div>
      </div>
    );
  }
}

DateRange.propTypes = {
  model: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func,
  locale: PropTypes.string,
  format: PropTypes.string
};
