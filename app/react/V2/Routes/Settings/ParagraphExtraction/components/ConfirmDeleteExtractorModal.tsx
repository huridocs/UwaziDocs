import React from 'react';
import { ConfirmationModal } from 'app/V2/Components/UI';
import { Translate } from 'app/I18N';
import { useSetAtom } from 'jotai';
import { notificationAtom } from 'app/V2/atoms';
import { useRevalidator } from 'react-router-dom';
import * as extractorsAPI from 'app/V2/api/paragraphExtractor/extractors';

const ConfirmDeleteExtractorModal = ({
  extractorIds,
  setIsProcessing,
  handleSuccessfulDeletion,
  showModal,
  header = 'Are you sure?',
  warningText,
}: {
  extractorIds: string[];
  setIsProcessing: (value: boolean) => void;
  handleSuccessfulDeletion: () => void;
  showModal: (value: boolean) => void;
  header?: string;
  warningText?: string;
}) => {
  const revalidator = useRevalidator();
  const setNotifications = useSetAtom(notificationAtom);

  const deleteExtractors = async () => {
    setIsProcessing(true);

    try {
      await extractorsAPI.remove(extractorIds);
      revalidator.revalidate();
      setNotifications({
        type: 'success',
        text: <Translate>Extractor/s deleted</Translate>,
      });
    } catch (error) {
      setNotifications({
        type: 'error',
        text: <Translate>An error occurred</Translate>,
        details: error.json?.prettyMessage ? error.json.prettyMessage : undefined,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ConfirmationModal
      header={<Translate>{header}</Translate>}
      warningText={<Translate>{warningText}</Translate>}
      onAcceptClick={async () => {
        await deleteExtractors();
        handleSuccessfulDeletion();
      }}
      onCancelClick={() => showModal(false)}
      dangerStyle
      acceptButton={<Translate>Delete</Translate>}
    />
  );
};

export { ConfirmDeleteExtractorModal };
