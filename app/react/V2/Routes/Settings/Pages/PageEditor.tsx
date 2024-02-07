/* eslint-disable max-statements */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from 'react';
import { IncomingHttpHeaders } from 'http';
import { Link, LoaderFunction, useBlocker, useLoaderData, useRevalidator } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Translate, t } from 'app/I18N';
import * as pagesAPI from 'V2/api/pages';
import { Page } from 'V2/shared/types';
import { SettingsContent } from 'V2/Components/Layouts/SettingsContent';
import { Button, CopyValueInput, Tabs } from 'V2/Components/UI';
import { CodeEditor, CodeEditorInstance } from 'V2/Components/CodeEditor';
import { ConfirmNavigationModal, EnableButtonCheckbox, InputField } from 'app/V2/Components/Forms';
import { notificationAtom } from 'V2/atoms';
import { FetchResponseError } from 'shared/JSONRequest';
import { getPageUrl } from './components/PageListTable';
import { HTMLNotification, JSNotification } from './components/PageEditorComponents';

const pageEditorLoader =
  (headers?: IncomingHttpHeaders): LoaderFunction =>
  async ({ params }) => {
    if (params.sharedId) {
      const page = await pagesAPI.getBySharedId(params.sharedId, params.lang || 'en', headers);

      return page;
    }

    return {};
  };

const PageEditor = () => {
  const page = useLoaderData() as Page;
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const revalidator = useRevalidator();
  const htmlEditor = useRef<CodeEditorInstance>();
  const JSEditor = useRef<CodeEditorInstance>();
  const setNotifications = useSetRecoilState(notificationAtom);

  const {
    register,
    reset,
    formState: { errors, isDirty, isSubmitting: formIsSubmitting },
    watch,
    getValues,
    handleSubmit,
  } = useForm({
    defaultValues: { title: t('System', 'New page', null, false) },
    values: page,
  });

  const blocker = useBlocker(isDirty && !formIsSubmitting);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowConfirmationModal(true);
    }
  }, [blocker, setShowConfirmationModal]);

  const save = async (data: Page) => {
    const newHTML = htmlEditor.current?.getValue();
    const newJS = JSEditor.current?.getValue();
    const hasChangedHTML = newHTML !== data.metadata?.content;
    const hasChangedJS = newJS !== data.metadata?.script;

    const updatedPage: Page = {
      ...data,
      metadata: {
        content: hasChangedHTML ? newHTML : data.metadata?.content,
        script: hasChangedJS ? newJS : data.metadata?.script,
      },
    };

    const response = await pagesAPI.save(updatedPage);

    if (!(response instanceof FetchResponseError)) {
      reset(response);
    }

    return response;
  };

  const handleSave = async (data: Page) => {
    const response = await save(data);

    const hasErrors = response instanceof FetchResponseError;

    setNotifications({
      type: !hasErrors ? 'success' : 'error',
      text: !hasErrors ? (
        <Translate>Saved successfully.</Translate>
      ) : (
        <Translate>An error occurred</Translate>
      ),
      ...(hasErrors && { details: response.message }),
    });

    revalidator.revalidate();
  };

  const handleSaveAndPreview = (data: Page) => {};

  const handleCancel = () => {};

  return (
    <div className="tw-content" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <SettingsContent>
        <SettingsContent.Header
          path={new Map([['Pages', '/settings/pages']])}
          title={watch('title')}
        />

        <SettingsContent.Body>
          <Tabs unmountTabs={false}>
            <Tabs.Tab id="Basic" label={<Translate>Basic</Translate>}>
              <form>
                <input className="hidden" {...register('sharedId')} />
                <div className="flex flex-col gap-4 max-w-2xl">
                  <div className="flex gap-4 items-center">
                    <Translate className="font-bold">
                      Enable this page to be used as an entity view page:
                    </Translate>
                    <EnableButtonCheckbox
                      {...register('entityView')}
                      defaultChecked={page.entityView}
                    />
                  </div>

                  <InputField
                    id="title"
                    label={<Translate>Title</Translate>}
                    {...register('title', { required: true })}
                  />

                  <CopyValueInput
                    value={
                      getValues('sharedId')
                        ? getPageUrl(getValues('sharedId')!, getValues('title'))
                        : ''
                    }
                    label={<Translate>URL</Translate>}
                    className="mb-4 w-full"
                    id="page-url"
                  />

                  {getValues('sharedId') && (
                    <Link
                      target="_blank"
                      to={getPageUrl(getValues('sharedId')!, getValues('title'))}
                    >
                      <div className="flex gap-2 hover:font-bold hover:cursor-pointer">
                        <ArrowTopRightOnSquareIcon className="w-4" />
                        <Translate className="underline hover:text-primary-700">
                          View page
                        </Translate>
                      </div>
                    </Link>
                  )}
                </div>
              </form>
            </Tabs.Tab>

            <Tabs.Tab id="Code" label={<Translate>Code</Translate>}>
              <div className="flex flex-col gap-2 h-full">
                <HTMLNotification />
                <CodeEditor
                  language="html"
                  code={getValues('metadata.content')}
                  getEditor={editor => {
                    htmlEditor.current = editor;
                  }}
                />
                <textarea {...register('metadata.content')} className="hidden" />
              </div>
            </Tabs.Tab>

            <Tabs.Tab id="Advanced" label={<Translate>Advanced</Translate>}>
              <div className="flex flex-col gap-2 h-full">
                <JSNotification />
                <CodeEditor
                  language="javascript"
                  code={getValues('metadata.script')}
                  getEditor={editor => {
                    JSEditor.current = editor;
                  }}
                />
                <textarea {...register('metadata.script')} className="hidden" />
              </div>
            </Tabs.Tab>
          </Tabs>
        </SettingsContent.Body>

        <SettingsContent.Footer>
          <div className="flex gap-2 justify-end">
            <Button styling="light" onClick={() => {}}>
              <Translate>Cancel</Translate>
            </Button>

            <Button styling="solid" color="primary" onClick={handleSubmit(handleSave)}>
              <Translate>Save & Preview</Translate>
            </Button>

            <Button styling="solid" color="success" onClick={handleSubmit(handleSave)}>
              <Translate>Save</Translate>
            </Button>
          </div>
        </SettingsContent.Footer>
      </SettingsContent>

      {showConfirmationModal && (
        <ConfirmNavigationModal
          setShowModal={setShowConfirmationModal}
          onConfirm={blocker.proceed}
        />
      )}
    </div>
  );
};

export { PageEditor, pageEditorLoader };
