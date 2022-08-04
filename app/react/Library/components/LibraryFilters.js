import { t, Translate } from 'app/I18N';
import SidePanel from 'app/Layout/SidePanel';
import { resetFilters } from 'app/Library/actions/filterActions';
import FiltersForm from 'app/Library/components/FiltersForm';
import { wrapDispatch } from 'app/Multireducer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from 'UI';
import { hideFilters } from 'app/Entities/actions/uiActions';

export class LibraryFilters extends Component {
  reset() {
    this.props.resetFilters(this.props.storeKey);
  }

  render() {
    return (
      <SidePanel className="library-filters" mode={this.props.sidePanelMode} open={this.props.open}>
        <div className="sidepanel-body without-footer">
          <div className="sidepanel-title">
            <div>{t('System', 'Filters configuration')}</div>
            <div className="filter-buttons">
              <div
                className={`clear-button push-left ${
                  this.props.sidePanelMode === 'unpinned-mode' ? '' : 'remove-margin'
                }`}
                onClick={this.reset.bind(this)}
              >
                <Icon icon="times" />
                &nbsp;<Translate>Clear Filters</Translate>
              </div>
              <button
                type="button"
                className={`closeSidepanel ${
                  this.props.sidePanelMode === 'unpinned-mode' ? '' : 'only-mobile'
                }`}
                onClick={this.props.hideFilters}
                aria-label="Close side panel"
              >
                <Icon icon="times" />
              </button>
            </div>
          </div>

          <FiltersForm storeKey={this.props.storeKey} />
        </div>
      </SidePanel>
    );
  }
}

LibraryFilters.defaultProps = {
  open: false,
  storeKey: 'library',
  sidePanelMode: '',
  hideFilters: () => {},
};

LibraryFilters.propTypes = {
  resetFilters: PropTypes.func.isRequired,
  open: PropTypes.bool,
  storeKey: PropTypes.string,
  sidePanelMode: PropTypes.string,
  hideFilters: PropTypes.func,
};

export function mapStateToProps(state, props) {
  const noDocumentSelected = state[props.storeKey].ui.get('selectedDocuments').size === 0;
  const isFilterShown = state[props.storeKey].ui.get('filtersPanel') !== false;
  return {
    open: noDocumentSelected && isFilterShown,
  };
}

function mapDispatchToProps(dispatch, props) {
  return bindActionCreators({ resetFilters, hideFilters }, wrapDispatch(dispatch, props.storeKey));
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryFilters);
