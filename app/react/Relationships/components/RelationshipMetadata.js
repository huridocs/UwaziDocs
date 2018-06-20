import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fromJS as Immutable } from 'immutable';
import { createSelector } from 'reselect';
import { Icon } from 'UI';

import { ShowMetadata, MetadataFormButtons } from 'app/Metadata';
import SidePanel from 'app/Layout/SidePanel';
import { unselectConnection } from '../actions/actions';

export class RelationshipMetadata extends Component {
  render() {
    return (
      <SidePanel open={this.props.selectedConnection} className="connections-metadata">
        <button className="closeSidepanel close-modal" onClick={this.props.unselectConnection}>
          <Icon icon="times" />
        </button>
        <div className="sidepanel-body">
          <ShowMetadata entity={this.props.entity} showTitle showType />
        </div>
        <div className="sidepanel-footer">
          <MetadataFormButtons exclusivelyViewButton data={Immutable(this.props.entity)}/>
        </div>
      </SidePanel>
    );
  }
}

RelationshipMetadata.propTypes = {
  selectedConnection: PropTypes.bool,
  entity: PropTypes.object,
  unselectConnection: PropTypes.func
};

const connectionSelector = createSelector(
  state => state.relationships.connection,
  entity => entity && entity.toJS ? entity.toJS() : { metadata: {} }
);

const mapStateToProps = state => ({
  selectedConnection: Boolean(state.relationships.connection && state.relationships.connection.get('_id')),
  entity: connectionSelector(state)
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    unselectConnection
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RelationshipMetadata);
