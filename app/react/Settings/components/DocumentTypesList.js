import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { I18NLink, t } from 'app/I18N';
import { deleteTemplate, checkTemplateCanBeDeleted } from 'app/Templates/actions/templatesActions';
import { Icon } from "UI";

import { notify } from 'app/Notifications/actions/notificationsActions';

export class DocumentTypesList extends Component {
  deleteTemplate(template) {
    return this.props.checkTemplateCanBeDeleted(template)
    .then(() => {
      this.context.confirm({
        accept: () => {
          this.props.deleteTemplate(template);
        },
        title: `${t('System', 'Confirm delete document type title', 'Confirm delete document type:', false)} ${template.name}`,
        message: t('System', 'Confirm delete document type message', 'Are you sure you want to delete this document type?', false)
      });
    })
    .catch(() => {
      this.context.confirm({
        accept: () => {},
        noCancel: true,
        title: `${t('System', 'Cannot delete document type title', 'Cannot delete document type:', false)} ${template.name}`,
        message: t('System', 'Cannot delete document type message', 'This document type has associated documents and cannot be deleted.', false)
      });
    });
  }

  render() {
    return (<div className="panel panel-default">
      <div className="panel-heading">{t('System', 'Document types')}</div>
      <ul className="list-group document-types">
        {this.props.templates.toJS().map((template, index) => {
          if (template.isEntity) {
            return false;
          }
          return (<li key={index} className="list-group-item">
            <I18NLink to={`/settings/documents/edit/${template._id}`}>{template.name}</I18NLink>
            <div className="list-group-item-actions">
              <I18NLink to={`/settings/documents/edit/${template._id}`} className="btn btn-default btn-xs">
                <Icon icon="pencil-alt" />&nbsp;
                <span>{t('System', 'Edit')}</span>
              </I18NLink>
              <a onClick={this.deleteTemplate.bind(this, template)} className="btn btn-danger btn-xs template-remove">
                <Icon icon="trash-alt" />&nbsp;
                <span>{t('System', 'Delete')}</span>
              </a>
            </div>
          </li>);
        })}
      </ul>
      <div className="settings-footer">
        <I18NLink to="/settings/documents/new" className="btn btn-success">
          <Icon icon="plus" />
          <span className="btn-label">{t('System', 'Add document type')}</span>
        </I18NLink>
      </div>
            </div>);
  }
}

DocumentTypesList.propTypes = {
  templates: PropTypes.object,
  deleteTemplate: PropTypes.func,
  notify: PropTypes.func,
  checkTemplateCanBeDeleted: PropTypes.func
};

DocumentTypesList.contextTypes = {
  confirm: PropTypes.func
};

export function mapStateToProps(state) {
  return { templates: state.templates };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ notify, deleteTemplate, checkTemplateCanBeDeleted }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentTypesList);
