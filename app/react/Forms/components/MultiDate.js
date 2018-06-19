import PropTypes from 'prop-types';
import React, {Component} from 'react';
import DatePicker from './DatePicker';
import { Icon } from 'UI';

export default class MultiDate extends Component {

  constructor(props) {
    super(props);
    let values = this.props.value && this.props.value.length ? this.props.value : [null];
    this.state = {values};
  }

  onChange(index, value) {
    let values = this.state.values.slice();
    values[index] = value;
    this.setState({values});
    this.props.onChange(values);
  }

  add(e) {
    e.preventDefault();
    let values = this.state.values.slice();
    values.push(null);
    this.setState({values});
  }

  remove(index, e) {
    e.preventDefault();
    let values = this.state.values.slice();
    values.splice(index, 1);
    this.setState({values});
    this.props.onChange(values);
  }

  render() {
    return <div className="multidate">
      {(() => {
        return this.state.values.map((value, index) => {
          return <div key={index} className="multidate-item">
                  <DatePicker locale={this.props.locale} format={this.props.format} onChange={this.onChange.bind(this, index)} value={value}/>
                  <button className="react-datepicker__delete-icon" onClick={this.remove.bind(this, index)}></button>
                 </div>;
        });
      })()}
      <button className="btn btn-success add" onClick={this.add.bind(this)}>
        <Icon icon="plus" />&nbsp;
        <span>Add date</span>
      </button>
    </div>;
  }

}

MultiDate.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  locale: PropTypes.string,
  format: PropTypes.string
};
