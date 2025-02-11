/* eslint-disable max-statements */
import React, { useMemo, useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { SettingsContent } from 'V2/Components/Layouts/SettingsContent';
import { Button, Table } from 'V2/Components/UI';
import { Translate } from 'app/I18N';
import { useSetAtom, useAtomValue } from 'jotai';
import { notificationAtom, templatesAtom } from 'V2/atoms';
import { tableColumns, NoDataMessage } from './components/PXTableElements';
import { PXTable, ParagraphExtractorApiResponse } from './types';
import { ExtractorModal } from './components/ExtractorModal';
import { formatExtractors } from './utils/formatExtractors';
import { PXTableFooter } from './components/PXTableFooter';
import { ConfirmDeleteExtractorModal } from './components/ConfirmDeleteExtractorModal';

const ParagraphExtractorDashboard = () => {
  const { extractors = [] } = useLoaderData() as {
    extractors: ParagraphExtractorApiResponse[];
  };

  const templates = useAtomValue(templatesAtom);
  const revalidator = useRevalidator();
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<PXTable[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [extractorModal, setExtractorModal] = useState(false);
  const setNotifications = useSetAtom(notificationAtom);

  const handleSave = async () => {
    revalidator.revalidate();
    setNotifications({
      type: 'success',
      text: <Translate>Paragraph Extractor added</Translate>,
    });
  };

  const paragraphExtractorData = useMemo(
    () => formatExtractors(extractors, templates),
    [extractors, templates]
  );

  const [searchParams] = useSearchParams();

  console.log(paragraphExtractorData);

  return (
    <div
      className="tw-content"
      data-testid="settings-paragraph-extractor"
      style={{ width: '100%', overflowY: 'auto' }}
    >
      <SettingsContent>
        <SettingsContent.Header title="Paragraph extraction" />
        <SettingsContent.Body>
          <Table
            data={paragraphExtractorData}
            columns={tableColumns}
            header={
              <Translate className="text-base font-semibold text-left text-gray-900 bg-white">
                Extractors
              </Translate>
            }
            enableSelections
            onChange={({ selectedRows }) => {
              setSelected(() => paragraphExtractorData.filter(ex => ex.rowId in selectedRows));
            }}
            defaultSorting={[{ id: '_id', desc: false }]}
            noDataMessage={<NoDataMessage />}
            footer={
              <PXTableFooter
                totalPages={10}
                currentDataLength={10}
                total={100}
                searchParams={searchParams}
              />
            }
          />
        </SettingsContent.Body>

        <SettingsContent.Footer className="flex gap-2">
          {selected?.length === 1 ? (
            <Button type="button" onClick={() => setExtractorModal(true)} disabled={isSaving}>
              <Translate>Edit Extractor</Translate>
            </Button>
          ) : undefined}

          {selected?.length ? (
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                color="error"
                onClick={() => setConfirmModal(true)}
                disabled={isSaving}
              >
                <Translate>Delete</Translate>
              </Button>
              <div className="text-gray-500">
                <Translate>Selected</Translate>{' '}
                <span className="text-gray-900 font-semibold">{selected.length}</span>{' '}
                <Translate>of</Translate>{' '}
                <span className="text-gray-900 font-semibold">{paragraphExtractorData.length}</span>
              </div>
            </div>
          ) : (
            <Button type="button" onClick={() => setExtractorModal(true)} disabled={isSaving}>
              <Translate>Add extractor</Translate>
            </Button>
          )}
        </SettingsContent.Footer>
      </SettingsContent>

      {confirmModal && (
        <ConfirmDeleteExtractorModal
          setIsProcessing={setIsSaving}
          extractorIds={selected?.map(selection => selection._id) as string[]}
          showModal={setConfirmModal}
          handleSuccessfulDeletion={() => {
            setConfirmModal(false);
            setSelected([]);
          }}
          warningText="Only the extractor will be deleted, all created entities will remain on the library."
        />
      )}

      {extractorModal && (
        <ExtractorModal
          setShowModal={setExtractorModal}
          onClose={() => setExtractorModal(false)}
          onAccept={handleSave}
          templates={templates}
          extractor={selected?.length ? selected[0] : undefined}
        />
      )}
    </div>
  );
};

export { ParagraphExtractorDashboard };
