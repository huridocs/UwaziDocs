/* eslint-disable max-lines */
/* eslint-disable max-statements */
import React, { useState } from 'react';
import * as extractorsAPI from 'app/V2/api/paragraphExtractor/extractors';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Modal, Button, MultiselectList } from 'V2/Components/UI';
import { Translate } from 'app/I18N';
import { ClientTemplateSchema } from 'app/istore';
import { ParagraphExtractorValues } from '../types';
import { NoQualifiedTemplatesMessage } from './NoQualifiedTemplate';

interface ExtractorModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  onAccept: () => void;
  templates: ClientTemplateSchema[];
  extractor?: ParagraphExtractorValues;
}

const formatOptions = (templates: ClientTemplateSchema[]) =>
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

const templatesWithParagraph = (template: ClientTemplateSchema) =>
  template.properties.some(({ name }) => name === 'rich_text');

const isActiveStepClassName = (isActive: boolean) => (isActive ? 'bg-indigo-700' : 'bg-gray-200');

const ExtractorModal = ({
  setShowModal,
  onClose,
  onAccept,
  templates,
  extractor,
}: ExtractorModalProps) => {
  const [step, setStep] = useState(1);
  console.log(extractor);
  const [templatesFrom, setTemplatesFrom] = useState<string[]>(extractor?.templatesFrom || []);
  const [templateTo, setTemplateTo] = useState<string[]>(
    extractor?.templateTo ? [extractor?.templateTo] : []
  );

  const [templateFromOptions] = useState(formatOptions(templates));
  const [templateToOptions] = useState(formatOptions(templates.filter(templatesWithParagraph)));

  const handleClose = () => {
    // setValues([]);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = {
        ...extractor,
        templatesFrom,
        templateTo: templateTo[0],
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
        <h1 className="text-xl font-medium text-gray-900">
          {extractor ? (
            <Translate>Edit Extractor</Translate>
          ) : (
            (step === 1 && <Translate>Target template</Translate>) ||
            (step === 2 && <Translate>Paragraph extractor</Translate>)
          )}
        </h1>
        <Modal.CloseButton onClick={() => setShowModal(false)} />
      </Modal.Header>

      <Modal.Body className="pt-0">
        <div className={`${step !== 1 && 'hidden'}`}>
          <MultiselectList
            value={templateTo}
            items={templateToOptions}
            onChange={selected => {
              setTemplateTo(selected);
            }}
            singleSelect
            startOnSelected={templateTo?.length > 0}
            className="min-h-[327px]"
            blankState={<NoQualifiedTemplatesMessage />}
          />
        </div>
        <div className={`${step !== 2 && 'hidden'}`}>
          <div>
            <MultiselectList
              value={templatesFrom || []}
              items={templateFromOptions}
              onChange={setTemplatesFrom}
              allowSelelectAll={templateFromOptions.length > 0}
              startOnSelected={templatesFrom.length > 0}
              className="min-h-[327px]"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-center w-full gap-2">
            {/* duplicate structure, can be a function */}
            <div className={`w-2 h-2 rounded-full ${isActiveStepClassName(step === 1)}`} />
            <div className={`w-2 h-2 rounded-full ${isActiveStepClassName(step === 2)}`} />
          </div>
          {templateToOptions.length !== 0 && step === 1 && (
            <span className="mt-5 text-gray-500 font-light text-sm">
              <Translate>Templates meeting required criteria</Translate>
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
                  className="grow"
                  onClick={() => setStep(2)}
                  disabled={templateTo.length === 0}
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
                <Button className="grow" onClick={async () => handleSubmit()} color="success">
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
