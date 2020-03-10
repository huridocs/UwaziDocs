import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import filesize from 'filesize';
import { NeedAuthorization } from 'app/Auth';
import ShowIf from 'app/App/ShowIf';

import AttachmentForm from 'app/Attachments/components/AttachmentForm';
import { wrapDispatch } from 'app/Multireducer';
import { Icon } from 'UI';

import {
  deleteAttachment,
  renameAttachment,
  loadForm,
  submitForm,
  resetForm,
} from '../actions/actions';

const getExtension = filename => filename.substr(filename.lastIndexOf('.') + 1);

const getItemOptions = (parentId, filename) => {
  const options = {};
  options.itemClassName = '';
  options.typeClassName = 'empty';
  options.icon = 'paperclip';
  options.deletable = true;
  options.replaceable = false;
  options.downloadHref = `/api/attachments/download?_id=${parentId}&file=${filename}`;

  return options;
};

const conformThumbnail = (file, item) => {
  const acceptedThumbnailExtensions = ['png', 'gif', 'jpg'];
  let thumbnail = null;

  if (getExtension(file.filename) === 'pdf') {
    thumbnail = (
      <span>
        <Icon icon="file-pdf" /> pdf
      </span>
    );
  }

  if (acceptedThumbnailExtensions.indexOf(getExtension(file.filename.toLowerCase())) !== -1) {
    thumbnail = <img src={item.downloadHref} alt={file.filename} />;
  }

  return <div className="attachment-thumbnail">{thumbnail}</div>;
};

export class Attachment extends Component {
  deleteAttachment(attachment) {
    this.context.confirm({
      accept: () => {
        this.props.deleteAttachment(this.props.parentId, attachment, this.props.storeKey);
      },
      title: 'Confirm delete',
      message: this.props.deleteMessage,
    });
  }

  render() {
    const { file, parentId, model, storeKey } = this.props;
    const sizeString = file.size ? filesize(file.size) : '';
    const item = getItemOptions(parentId, file.filename);

    let name = (
      <a className="attachment-link" href={item.downloadHref}>
        {conformThumbnail(file, item)}
        <span className="attachment-name">
          <span>{file.originalname}</span>
          <ShowIf if={Boolean(sizeString)}>
            <span className="attachment-size">{sizeString}</span>
          </ShowIf>
        </span>
      </a>
    );

    let buttons = (
      <div>
        <NeedAuthorization roles={['admin', 'editor']}>
          <div className="attachment-buttons">
            <ShowIf if={!this.props.readOnly}>
              <button
                type="button"
                className="item-shortcut btn btn-default"
                onClick={this.props.loadForm.bind(this, model, file)}
              >
                <Icon icon="pencil-alt" />
              </button>
            </ShowIf>
            <ShowIf if={item.deletable && !this.props.readOnly}>
              <button
                type="button"
                className="item-shortcut btn btn-default btn-hover-danger"
                onClick={this.deleteAttachment.bind(this, file)}
              >
                <Icon icon="trash-alt" />
              </button>
            </ShowIf>
          </div>
        </NeedAuthorization>
      </div>
    );

    if (this.props.beingEdited && !this.props.readOnly) {
      name = (
        <div className="attachment-link">
          {conformThumbnail(file, item)}
          <span className="attachment-name">
            <AttachmentForm
              model={this.props.model}
              onSubmit={this.props.renameAttachment.bind(this, parentId, model, storeKey)}
            />
          </span>
        </div>
      );

      buttons = (
        <div className="attachment-buttons">
          <div className="item-shortcut-group">
            <NeedAuthorization roles={['admin', 'editor']}>
              <button
                type="button"
                className="item-shortcut btn btn-primary"
                onClick={this.props.resetForm.bind(this, model)}
              >
                <Icon icon="times" />
              </button>
            </NeedAuthorization>
            <NeedAuthorization roles={['admin', 'editor']}>
              <button
                type="button"
                className="item-shortcut btn btn-success"
                onClick={this.props.submitForm.bind(this, model, storeKey)}
              >
                <Icon icon="save" />
              </button>
            </NeedAuthorization>
          </div>
        </div>
      );
    }

    return (
      <div className="attachment">
        {name}
        {buttons}
      </div>
    );
  }
}

Attachment.defaultProps = {
  deleteMessage: 'Are you sure you want to delete this attachment?',
};

Attachment.propTypes = {
  deleteMessage: PropTypes.string,
  file: PropTypes.object,
  parentId: PropTypes.string,
  storeKey: PropTypes.string,
  model: PropTypes.string,
  readOnly: PropTypes.bool,
  beingEdited: PropTypes.bool,
  deleteAttachment: PropTypes.func,
  renameAttachment: PropTypes.func,
  loadForm: PropTypes.func,
  submitForm: PropTypes.func,
  resetForm: PropTypes.func,
};

Attachment.contextTypes = {
  confirm: PropTypes.func,
};

export function mapStateToProps({ attachments }, ownProps) {
  return {
    model: 'attachments.edit.attachment',
    beingEdited: ownProps.file._id && attachments.edit.attachment._id === ownProps.file._id,
  };
}

function mapDispatchToProps(dispatch, props) {
  return bindActionCreators(
    { deleteAttachment, renameAttachment, loadForm, submitForm, resetForm },
    wrapDispatch(dispatch, props.storeKey)
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Attachment);
