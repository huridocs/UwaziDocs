/* eslint-disable max-lines */
/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react';
import * as extractorsAPI from 'app/V2/api/paragraphExtractor/extractors';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Modal, Button, MultiselectList } from 'V2/Components/UI';
import { Translate } from 'app/I18N';
import { Template } from 'app/apiResponseTypes';
import { Link } from 'react-router-dom';
import { ParagraphExtractorApiPayload } from '../types';
import { NoQualifiedTemplatesMessage } from './NoQualifiedTemplate';

interface ExtractorModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  onAccept: () => void;
  templates: Template[];
  extractor?: ParagraphExtractorApiPayload;
}

const formatOptions = (templates: Template[]) =>
  templates.map(template => {
    const option = {
      label: template.name,
      id: template._id,
      searchLabel: template.name,
      value: template._id,
      properties: template.properties,
    };
    return option;
  });

const templatesWithParagraph = (template: Template) =>
  template.properties?.some(({ name }) => name === 'rich_text');

const isActiveStepClassName = (isActive: boolean) => (isActive ? 'bg-indigo-700' : 'bg-gray-200');

const linkPXTemplateCriteria =
  'https://uwazi.readthedocs.io/en/latest/admin-docs/paragraph-extraction.html';

const ExtractorModal = ({
  setShowModal,
  onClose,
  onAccept,
  templates,
  extractor,
}: ExtractorModalProps) => {
  const [step, setStep] = useState(1);
  const [sourceTemplateIds, setSourceTemplateIds] = useState<string[]>(
    extractor?.sourceTemplateIds || []
  );
  const [targetTemplateId, setTargetTemplateId] = useState<string>(
    extractor?.targetTemplateId ?? ''
  );

  const [targetTemplateOptions] = useState(formatOptions(templates.filter(templatesWithParagraph)));
  const [sourceTemplateOptions, setSourceTemplateOptions] = useState(
    formatOptions(templates.filter(template => template._id !== targetTemplateId))
  );

  useEffect(() => {
    setSourceTemplateOptions(
      formatOptions(templates.filter(template => template._id !== targetTemplateId))
    );
  }, [targetTemplateId, templates]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = {
        ...extractor,
        sourceTemplateIds,
        targetTemplateId,
      };
      await extractorsAPI.save(values);
      handleClose();
      onAccept();
    } catch (e) {
      console.error('Error saving extractor:', e);
    }
  };

  return (
    <Modal size="xxl">
      <Modal.Header>
        <h1 className="text-lg font-semibold text-gray-900">
          {extractor ? (
            <Translate>Edit Extractor</Translate>
          ) : (
            (step === 1 && <Translate>Target template</Translate>) ||
            (step === 2 && <Translate>Source template</Translate>)
          )}
        </h1>
        <Modal.CloseButton onClick={() => setShowModal(false)} />
      </Modal.Header>

      <Modal.Body className="pt-0">
        <div className={`${step !== 1 ? 'hidden' : ''}`}>
          <MultiselectList
            value={[targetTemplateId]}
            items={targetTemplateOptions}
            onChange={selected => {
              setTargetTemplateId(selected[0]);
            }}
            singleSelect
            startOnSelected={!!targetTemplateId}
            className="min-h-[327px]"
            hideFilters
            itemContainerClassName="max-h-[327px] overflow-y-auto my-4"
            blankState={<NoQualifiedTemplatesMessage />}
          />
        </div>
        <div className={`${step !== 2 ? 'hidden' : ''}`}>
          <div>
            <MultiselectList
              value={sourceTemplateIds || []}
              items={sourceTemplateOptions}
              onChange={setSourceTemplateIds}
              allowSelelectAll={false}
              startOnSelected={sourceTemplateIds.length > 0}
              itemContainerClassName="max-h-[327px] overflow-y-auto my-4"
              className="min-h-[327px]"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div
            className={`flex justify-center w-full gap-2 ${targetTemplateOptions.length === 0 ? 'opacity-50' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full ${isActiveStepClassName(step === 1)}`} />
            <div className={`w-2 h-2 rounded-full ${isActiveStepClassName(step === 2)}`} />
          </div>
          {step === 1 && (
            <span
              className={`mt-5 text-gray-500 font-light text-sm ${targetTemplateOptions.length === 0 ? 'invisible' : ''}`}
            >
              <Translate>Templates meeting</Translate>{' '}
              <Link to={linkPXTemplateCriteria} target="_blank" className="underline">
                <Translate>required criteria</Translate>
              </Link>
            </span>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex flex-col w-full">
          <div className="flex gap-2">
            {step === 1 ? (
              <>
                <Button styling="light" onClick={() => setShowModal(false)} className="grow">
                  <Translate>Cancel</Translate>
                </Button>
                <Button
                  className="grow bg-indigo-800 disabled:opacity-50"
                  onClick={() => setStep(2)}
                  disabled={!targetTemplateId}
                >
                  <span className="flex items-center justify-center gap-2 flex-nowrap">
                    <Translate>Next</Translate>
                    <ArrowRightIcon className="w-5" />
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Button styling="light" onClick={() => setStep(1)} className="grow">
                  <Translate>Back</Translate>
                </Button>
                <Button
                  className="grow bg-indigo-800 disabled:opacity-50"
                  onClick={async () => handleSubmit()}
                  disabled={!sourceTemplateIds.length}
                >
                  {extractor ? <Translate>Update</Translate> : <Translate>Add</Translate>}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export { ExtractorModal, formatOptions };
