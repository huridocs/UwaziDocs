import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { ClientFile, IStore } from 'app/istore';
import { Translate } from 'app/I18N';
import { Icon } from 'app/UI';

type SupportingFilesProps = {
  storeKey?: string;
};

const mapStateToProps = (state: IStore, ownProps: SupportingFilesProps) => {
  const { storeKey } = ownProps;
  const entity =
    storeKey === 'library' ? state.library.sidepanel.metadata : state.entityView.entity.toJS();

  return {
    entity,
  };
};

const connector = connect(mapStateToProps);

type mappedProps = ConnectedProps<typeof connector>;
type ComponentProps = SupportingFilesProps & mappedProps;

const SupportingFiles = ({ entity }: ComponentProps) => {
  const { attachments = [] } = entity;
  return (
    <div>
      <h2>
        <Translate>Supporting files</Translate>
      </h2>

      <div className="attachments-list">
        {attachments.map((file: ClientFile) => (
          <div className="attachment" key={file._id}>
            <div className="attachment-thumbnail">
              <img src={`/api/files/${file.filename}`} alt={file.originalname} />
            </div>
            <div className="attachment-name">
              <input type="text" placeholder={file.originalname} />
            </div>
            <button type="button" className="btn btn-danger">
              <Icon icon="trash-alt" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const container = connector(SupportingFiles);
export { container as SupportingFiles };
