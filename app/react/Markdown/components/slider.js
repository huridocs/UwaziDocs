import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'UI';

export default class VictimSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // initialize slider with a victim that has an image
      currentIndex: 0
    };
  }

  componentWillMount() {
    const {initialIndex} = this.props;
    this.setState({
      currentIndex: initialIndex || 0
    });
  }

  slide(dir) {
    let {currentIndex} = this.state;
    const {children} = this.props;
    currentIndex = this.normalizeIndex(currentIndex + dir, children.length);
    this.setState({currentIndex});
  }

  normalizeIndex(index, length) {
    return index >= 0 ? index % length : length + index;
  }

  getVisibleIndices(centerIndex, visibleCount, totalLength) {
    const minIndex = -Math.floor(visibleCount / 2);
    const rawIndices = [];
    for (let i = 0; i < visibleCount; i += 1) {
      rawIndices.push(centerIndex + minIndex + i);
    }
    return rawIndices.map(i => this.normalizeIndex(i, totalLength));
  }

  getVisibleItems(data, currentIndex, visibleCount) {
    if (!data.length) {
      return [];
    }
    const visibleIndices = this.getVisibleIndices(currentIndex, visibleCount, data.length);
    const visibleItems = visibleIndices.map(i => data[i]);
    return visibleItems;
  }

  render() {
    const {children, visibleCount} = this.props;
    const {currentIndex} = this.state;
    const items = this.getVisibleItems(children, currentIndex, visibleCount);
    return (
      <div className="slider">
        <div className="slider-buttons">
          <button className="slider-btn"
            onClick={() => this.slide(-1)}>
            <Icon icon="angle-left" />
          </button>
          <button className="slider-btn"
            onClick={() => this.slide(1)}>
            <Icon icon="angle-right" />
          </button>
        </div>
        <div className="slider-items">
          { items }
        </div>
      </div>
    );
  }

}
VictimSlider.propTypes = {
  visibleCount: PropTypes.number,
  initialIndex: PropTypes.number,
  title: PropTypes.string,
  children: PropTypes.array
};
