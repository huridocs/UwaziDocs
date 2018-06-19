import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {I18NLink} from 'app/I18N';
import {connect} from 'react-redux';
import {Form, Field} from 'react-redux-form';
import {MarkDown} from 'app/ReactReduxForms';
import ShowIf from 'app/App/ShowIf';
import { Icon } from 'UI';

import {resetPage, savePage} from 'app/Pages/actions/pageActions';
import validator from './ValidatePage';

export class PageCreator extends Component {

  componentWillUnmount() {
    this.props.resetPage();
  }

  render() {
    const {formState, page, savingPage} = this.props;
    let backUrl = '/settings/pages';
    let pageUrl = 'http://' + window.location.host + '/page/' + page.data.sharedId;

    let nameGroupClass = 'template-name form-group';
    if (formState.title && !formState.title.valid && (formState.submitFailed || formState.title.touched)) {
      nameGroupClass += ' has-error';
    }

    return (
      <div className="page-creator">
        <Form
          model="page.data"
          onSubmit={this.props.savePage}
          validators={validator()}>
          <div className="panel panel-default">
            <div className="metadataTemplate-heading panel-heading">
              <div className={nameGroupClass}>
                <Field model=".title">
                  <input placeholder="Page name" className="form-control"/>
                </Field>
              </div>
            </div>
            <div className="panel-body page-viewer document-viewer">
              <ShowIf if={Boolean(page.data._id)}>
                <div className="alert alert-info">
                  <Icon icon="terminal" /> {pageUrl}
                  <a target="_blank" href={pageUrl} className="pull-right">(view page)</a>
                </div>
              </ShowIf>
              <MarkDown model=".metadata.content" rows={18} />
            </div>
          </div>
          <div className="settings-footer">
            <I18NLink to={backUrl} className="btn btn-default">
              <Icon icon="arrow-left" />
              <span className="btn-label">Back</span>
            </I18NLink>
            <button type="submit"
                    className="btn btn-success save-template"
                    disabled={!!savingPage}>
              <Icon icon="save" />
              <span className="btn-label">Save</span>
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

PageCreator.propTypes = {
  resetPage: PropTypes.func,
  savePage: PropTypes.func,
  page: PropTypes.object,
  formState: PropTypes.object,
  savingPage: PropTypes.bool
};

function mapStateToProps({page}) {
  return {page: page, formState: page.formState, savingPage: page.uiState.get('savingPage')};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({resetPage, savePage}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PageCreator);
