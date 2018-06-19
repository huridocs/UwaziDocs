import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {t} from 'app/I18N';
import { Icon } from 'UI';

const SnippetsTab = ({snippets}) => {
  return <div>
    <Icon icon="search" />
    <span className="connectionsNumber">{snippets.size ? snippets.size : ''}</span>
    <span className="tab-link-tooltip">{t('System', 'Search text')}</span>
  </div>;
};

SnippetsTab.propTypes = {
  snippets: PropTypes.object
};

function mapStateToProps(state, props) {
  return {
    snippets: state[props.storeKey].sidepanel.snippets
  };
}

export default connect(mapStateToProps)(SnippetsTab);
