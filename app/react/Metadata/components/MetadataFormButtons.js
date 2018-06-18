import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {wrapDispatch} from 'app/Multireducer';

import ShowIf from 'app/App/ShowIf';
import {NeedAuthorization} from 'app/Auth';
import {t, I18NLink} from 'app/I18N';
import { Icon } from 'UI';

import * as actions from '../actions/actions';

export class MetadataFormButtons extends Component {
  render() {
    const {entityBeingEdited, exclusivelyViewButton} = this.props;
    const formName = this.props.formName || 'metadataForm';
    const data = this.props.data.toJS();

    const ViewButton = <I18NLink to={`${data.type}/${data.sharedId}`}>
                        <button className="edit-metadata btn btn-primary">
                          <Icon icon="file" /><span className="btn-label">{t('System', 'View')}</span>
                        </button>
                       </I18NLink>;

    if (exclusivelyViewButton) {
      return <span>{ViewButton}</span>;
    }

    return (
      <span>
        <ShowIf if={this.props.includeViewButton}>
          {ViewButton}
        </ShowIf>
        <NeedAuthorization roles={['admin', 'editor']}>
          <ShowIf if={!entityBeingEdited}>
            <button
              onClick={() => this.props.loadInReduxForm(this.props.formStatePath, data, this.props.templates.toJS())}
              className="edit-metadata btn btn-primary">
              <Icon icon="pencil-alt" />
              <span className="btn-label">{t('System', 'Edit')}</span>
            </button>
          </ShowIf>
        </NeedAuthorization>
        <ShowIf if={entityBeingEdited}>
          <button
            onClick={() => this.props.resetForm(this.props.formStatePath)}
            className="cancel-edit-metadata btn btn-primary">
            <Icon icon="times" />
            <span className="btn-label">{t('System', 'Cancel')}</span>
          </button>
        </ShowIf>
        <ShowIf if={entityBeingEdited}>
          <button type="submit" form={formName} className="btn btn-success">
            <Icon icon="save" />
            <span className="btn-label">{t('System', 'Save')}</span>
          </button>
        </ShowIf>
        <NeedAuthorization roles={['admin', 'editor']}>
          <ShowIf if={!entityBeingEdited}>
            <button className="delete-metadata btn btn-danger" onClick={this.props.delete}>
              <Icon icon="trash-alt" />
              <span className="btn-label">{t('System', 'Delete')}</span>
            </button>
          </ShowIf>
        </NeedAuthorization>
      </span>
    );
  }
}

MetadataFormButtons.propTypes = {
  loadInReduxForm: PropTypes.func,
  resetForm: PropTypes.func,
  delete: PropTypes.func,
  templates: PropTypes.object,
  data: PropTypes.object,
  entityBeingEdited: PropTypes.bool,
  formStatePath: PropTypes.string,
  formName: PropTypes.string,
  includeViewButton: PropTypes.bool,
  exclusivelyViewButton: PropTypes.bool
};

const mapStateToProps = ({templates}) => {
  return {templates};
};

function mapDispatchToProps(dispatch, props) {
  return bindActionCreators({
    loadInReduxForm: actions.loadInReduxForm,
    resetForm: actions.resetReduxForm
  }, wrapDispatch(dispatch, props.storeKey));
}

export default connect(mapStateToProps, mapDispatchToProps)(MetadataFormButtons);
