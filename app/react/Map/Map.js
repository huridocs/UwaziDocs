import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import Immutable from 'immutable';
import { isClient } from 'app/utils';
import supercluster from 'supercluster'; //eslint-disable-line
import _style from './style.json';
import { getMarkersBoudingBox, markersToStyleFormat } from './helper';
import { Icon } from 'UI';

if (isClient) {
  require('mapbox-gl').setRTLTextPlugin('/public/mapbox-gl-rtl-text.js.min');//eslint-disable-line
}


export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: props.latitude || 46,
        longitude: props.longitude || 6,
        width: props.width || 250,
        height: props.height || 200,
        zoom: props.zoom,
      },
      selectedMarker: null
    };
    this.mapStyle = Immutable.fromJS(_style);
    this.supercluster = supercluster({
        radius: _style.sources.markers.clusterRadius,
        maxZoom: _style.sources.markers.clusterMaxZoom
    });
    this.updateMapStyle(props);
    this._onViewportChange = (viewport) => {
      this.setState({ viewport });
    };

    this.setSize = this.setSize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
  }

  componentDidMount() {
    this.setSize();
    const map = this.map.getMap();
    map.on('style.load', () => this.centerOnMarkers(this.props.markers));
    map.on('moveend', (e) => {
      if (e.autoCentered) {
        this.setViweport(map);
      }
    });
    this.eventListener = window.addEventListener('resize', this.setSize);
  }

  componentWillReceiveProps(props) {
    const { markers } = props;
    const latitude = props.latitude || this.state.viewport.latitude;
    const longitude = props.longitude || this.state.viewport.longitude;
    const viewport = Object.assign(this.state.viewport, { latitude, longitude, markers });
    if (JSON.stringify(props.markers) !== JSON.stringify(this.props.markers)) {
      this.centerOnMarkers(markers);
      this.updateMapStyle(props);
    }
    this.setState({ viewport });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setSize);
  }

  onClick(e) {
    const markers = e.features.filter(f => f.layer.id === 'unclustered-point');
    const cluster = e.features.find(f => f.layer.id === 'clusters');

    if (markers.length === 1) {
      this.clickOnMarker(this.props.markers[markers[0].properties.index]);
    }
    if (markers.length > 1) {
      const markersOnCluster = markers.map(marker => this.props.markers[marker.properties.index]);
      this.clickOnCluster(markersOnCluster);
    }
    if (cluster) {
      const map = this.map.getMap();
      const currentData = this.mapStyle.getIn(['sources', 'markers', 'data', 'features']).toJS();
      this.supercluster.load(currentData);
      const markersOnCluster = this.supercluster.getLeaves(cluster.properties.cluster_id, Math.floor(map.getZoom()), Infinity);
      this.clickOnCluster(markersOnCluster);
    }
    this.props.onClick(e);
  }

  onHover(e) {
    const feature = e.features.find(f => f.layer.id === 'unclustered-point');
    if (feature) {
      this.hoverOnMarker(this.props.markers[feature.properties.index]);
    }
    if (!feature && this.state.selectedMarker && this.props.cluster) {
      this.setState({ selectedMarker: null });
    }
  }

  setSize() {
    const { viewport } = this.state;
    viewport.width = this.props.width || this.container.offsetWidth;
    viewport.height = this.props.height || this.container.offsetHeight;
    this.setState({ viewport });
  }

  setViweport(map) {
    const viewport = Object.assign(this.state.viewport, {
      latitude: map.getCenter().lat,
      longitude: map.getCenter().lng,
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing()
    });
    this.setState({ viewport });
  }

  centerOnMarkers(markers) {
    if (!this.map || !markers.length || !this.props.autoCenter) {
      return;
    }
    const map = this.map.getMap();
    const boundaries = getMarkersBoudingBox(markers);
    map.stop().fitBounds(boundaries, { padding: { top: 70, left: 20, right: 20, bottom: 20 }, maxZoom: 5 }, { autoCentered: true });
  }

  updateMapStyle(props) {
    if (!this.props.cluster) {
      return;
    }

    const markersData = markersToStyleFormat(props.markers);
    const currentData = this.mapStyle.getIn(['sources', 'markers', 'data', 'features']);
    if (!currentData.equals(Immutable.fromJS(markersData))) {
      const style = this.mapStyle.setIn(['sources', 'markers', 'data', 'features'], Immutable.fromJS(markersData));
      this.mapStyle = style;
      this.supercluster.load(markersData);
    }
  }

  clickOnMarker(marker) {
    this.props.clickOnMarker(marker);
  }

  clickOnCluster(cluster) {
    this.props.clickOnCluster(cluster);
  }

  hoverOnMarker(marker) {
    if (this.state.selectedMarker !== marker) {
      this.setState({ selectedMarker: marker });
    }
    this.props.hoverOnMarker(marker);
  }

  renderMarker(marker, onClick, onMouseEnter, onMouseLeave) {
    if (this.props.renderMarker) {
      return this.props.renderMarker(marker, onClick);
    }
    return (
      <Icon
        style={{ position: 'relative', top: '-25px', right: '15px', color: '#d9534e' }}
        icon="map-marker"
        size="2x"
        fixedWidth
        onClick={onClick}
        onMouseOver={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );
  }

  renderPopup() {
    const { selectedMarker } = this.state;
    if (selectedMarker && (this.props.renderPopupInfo || (selectedMarker.properties && selectedMarker.properties.info))) {
      return (
        <Popup
          tipSize={6}
          anchor="bottom"
          longitude={selectedMarker.longitude}
          latitude={selectedMarker.latitude}
          offsetTop={-20}
          closeButton={false}
        >
          <div>
            {this.props.renderPopupInfo ? this.props.renderPopupInfo(selectedMarker) : selectedMarker.properties.info}
          </div>
        </Popup>);
    }
    return false;
  }

  renderMarkers() {
    const { markers, cluster } = this.props;
    if (cluster) {
      return false;
    }

    return markers.map((marker, index) => {
      const onClick = this.clickOnMarker.bind(this, marker);
      const onMouseEnter = this.hoverOnMarker.bind(this, marker);
      const onMouseLeave = this.hoverOnMarker.bind(this, null);
      return (
        <Marker {...marker} key={index} offsetLeft={0} offsetTop={0}>
          {this.renderMarker(marker, onClick, onMouseEnter, onMouseLeave)}
        </Marker>
      );
    });
  }

  render() {
    const viewport = Object.assign({}, this.state.viewport);
    return (
      <div className="map-container" ref={(container) => { this.container = container; }} style={{ width: '100%', height: '100%' }}>
        <ReactMapGL
          ref={ref => this.map = ref}
          {...viewport}
          dragRotate
          mapStyle={this.mapStyle}
          onViewportChange={this._onViewportChange}
          onClick={this.onClick}
          onHover={this.onHover}
        >
          {this.renderMarkers()}
          {this.renderPopup()}
          <span className="mapbox-help">
            <Icon icon="question-circle" />
            <span className="mapbox-tooltip">Hold shift to rotate the map</span>
          </span>
        </ReactMapGL>
      </div>
    );
  }
}

Map.defaultProps = {
  markers: [],
  latitude: null,
  longitude: null,
  zoom: 4,
  width: null,
  height: null,
  onClick: () => {},
  clickOnMarker: () => {},
  hoverOnMarker: () => {},
  clickOnCluster: () => {},
  renderPopupInfo: null,
  renderMarker: null,
  cluster: false,
  autoCenter: true
};

Map.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.object),
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  zoom: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
  clickOnMarker: PropTypes.func,
  renderPopupInfo: PropTypes.func,
  clickOnCluster: PropTypes.func,
  hoverOnMarker: PropTypes.func,
  renderMarker: PropTypes.func,
  cluster: PropTypes.bool,
  autoCenter: PropTypes.bool
};
