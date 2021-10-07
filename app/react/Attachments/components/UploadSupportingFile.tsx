import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ActionCreator } from 'redux';

import { Translate } from 'app/I18N';
import { Icon } from 'UI';

import { AttachmentsModal } from './AttachmentsModal';

interface UploadSupportingFileProps {
  entitySharedId: string;
  storeKey: string;
  uploadAttachmentAction: ActionCreator<any>;
  uploadAttachmentFromUrlAction: ActionCreator<any>;
  progress?: any;
}

const UploadSupportingFile = (props: UploadSupportingFileProps) => {
  const {
    entitySharedId,
    storeKey,
    progress,
    uploadAttachmentAction,
    uploadAttachmentFromUrlAction,
  } = props;
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const getPercentage = progress.get(entitySharedId);

  useEffect(() => {
    if (getPercentage === 100) {
      closeModal();
    }
  }, [progress]);

  return (
    <>
      {getPercentage === undefined ? (
        <button
          type="button"
          onClick={openModal}
          className="upload-button btn btn-success attachments-modal-trigger"
        >
          <Icon icon="plus" />
          &nbsp;&nbsp;
          <Translate>Add supporting file</Translate>
        </button>
      ) : (
        <div className="btn btn-default btn-disabled">
          <Translate>Uploading</Translate>
          <span>&nbsp;{getPercentage}%</span>
        </div>
      )}
      <AttachmentsModal
        isOpen={modalOpen}
        onClose={closeModal}
        entitySharedId={entitySharedId}
        storeKey={storeKey}
        getPercentage={getPercentage}
        uploadAttachmentAction={uploadAttachmentAction}
        uploadAttachmentFromUrlAction={uploadAttachmentFromUrlAction}
      />
    </>
  );
};

export function mapStateToProps({ attachments }: { attachments: any }) {
  return {
    progress: attachments.progress,
  };
}

export default connect(mapStateToProps)(UploadSupportingFile);
