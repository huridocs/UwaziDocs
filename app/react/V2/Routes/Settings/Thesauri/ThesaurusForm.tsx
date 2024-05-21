/* eslint-disable max-statements */
/* eslint-disable max-lines */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, LoaderFunction, useBlocker, useLoaderData, useNavigate } from 'react-router-dom';
import { IncomingHttpHeaders } from 'http';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { Row } from '@tanstack/react-table';
import { Translate } from 'app/I18N';
import { SettingsContent } from 'V2/Components/Layouts/SettingsContent';
import { Button, Table } from 'V2/Components/UI';
import { ConfirmNavigationModal, InputField } from 'V2/Components/Forms';
import { ClientThesaurusValue, ClientThesaurus } from 'app/apiResponseTypes';
import { notificationAtom } from 'V2/atoms/notificationAtom';
import ThesauriAPI from 'V2/api/thesauri';
import uniqueID from 'shared/uniqueID';
import { ThesaurusSchema } from 'shared/types/thesaurusType';
import {
  ThesauriValueFormSidepanel,
  FormThesauriValue,
} from './components/ThesauriValueFormSidepanel';
import { ThesauriGroupFormSidepanel } from './components/ThesauriGroupFormSidepanel';
import { sanitizeThesaurusValues } from './helpers';
import { ImportButton } from './components/ImportButton';
import { columns, TableThesaurusValue } from './components/TableComponents';

const editTheasaurusLoader =
  (headers?: IncomingHttpHeaders): LoaderFunction =>
  async ({ params: { _id } }) => {
    const response = await ThesauriAPI.getThesauri({ _id }, headers);
    return response[0];
  };

const ThesaurusForm = () => {
  const navigate = useNavigate();
  const thesaurus = useLoaderData() as ClientThesaurus;
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [groupFormValues, setGroupFormValues] = useState<FormThesauriValue>();
  const [itemFormValues, setItemFormValues] = useState<FormThesauriValue[]>([]);
  const [showThesauriValueFormSidepanel, setShowThesauriValueFormSidepanel] = useState(false);
  const [showThesauriGroupFormSidepanel, setShowThesauriGroupFormSidepanel] = useState(false);
  const [selectedThesaurusValue, setSelectedThesaurusValue] = useState<Row<TableThesaurusValue>[]>(
    []
  );
  const [thesaurusValues, setThesaurusValues] = useState<TableThesaurusValue[]>([]);
  const setNotifications = useSetAtom(notificationAtom);

  useEffect(() => {
    if (thesaurus) {
      const values = thesaurus.values || [];
      const valuesWithIds = values.map((value: ClientThesaurusValue) => ({
        ...value,
        _id: `temp_${uniqueID()}`,
        values: value.values?.map(val => ({
          ...val,
          _id: `temp_${uniqueID()}`,
        })),
      }));
      setThesaurusValues(valuesWithIds);
    }
  }, [thesaurus]);

  const {
    watch,
    register,
    getValues,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ClientThesaurus>({
    defaultValues: thesaurus,
    mode: 'onSubmit',
  });

  const blocker = useBlocker(({ nextLocation }) => {
    const nameHasChanged = isDirty;
    const hasSaved = nextLocation.pathname.includes('edit');
    if (hasSaved) return false;
    if (thesaurus) {
      // We are editing
      const valuesHaveChanged = thesaurusValues.length !== thesaurus.values.length;
      return valuesHaveChanged || thesaurus.name !== getValues().name;
    }
    const newValues = Boolean(thesaurusValues.length);
    return newValues || nameHasChanged;
  });

  useMemo(() => {
    if (blocker.state === 'blocked') {
      setShowNavigationModal(true);
    }
  }, [blocker, setShowNavigationModal]);

  const addItem = () => {
    setItemFormValues([]);
    setShowThesauriValueFormSidepanel(true);
  };

  const addGroup = () => {
    setGroupFormValues({
      _id: `temp_${uniqueID()}`,
      label: '',
      values: [{ label: '', _id: `temp_${uniqueID()}` }],
    });
    setShowThesauriGroupFormSidepanel(true);
  };

  const editGroup = (row: Row<TableThesaurusValue>) => {
    setGroupFormValues(row.original);
    setShowThesauriGroupFormSidepanel(true);
  };

  const editValue = (row: Row<TableThesaurusValue>) => {
    setItemFormValues([{ ...row.original, groupId: row.getParentRow()?.original._id }]);
    setShowThesauriValueFormSidepanel(true);
  };

  const edit = (row: Row<TableThesaurusValue>) => {
    if (row.original.values) {
      editGroup(row);
    } else {
      editValue(row);
    }
  };

  const deleteSelected = () => {
    const parentsDeleted = thesaurusValues.filter(
      currentValue =>
        !selectedThesaurusValue.find(selected => selected.original._id === currentValue._id)
    );

    const childrenDeleted = parentsDeleted.map(singleThesaurus => {
      if (singleThesaurus.values) {
        const newValues = singleThesaurus.values?.filter(
          currentGroupItem =>
            !selectedThesaurusValue.find(selected => selected.original._id === currentGroupItem._id)
        );
        singleThesaurus.values = newValues;
      }
      return singleThesaurus;
    });

    setThesaurusValues(childrenDeleted);
  };

  const sortValues = () => {
    const valuesCopy = [...thesaurusValues];
    valuesCopy.sort((first, second) => (first.label > second.label ? 1 : -1));
    setThesaurusValues(valuesCopy);
  };

  const addItemSubmit = (items: FormThesauriValue[]) => {
    const addingNewItems = !items[0]._id;
    const thesaurusValuesCopy = [...thesaurusValues];
    if (addingNewItems) {
      items.forEach(item => {
        const itemWithId = { ...item, _id: `temp_${uniqueID()}` };
        if (!itemWithId.groupId) {
          thesaurusValuesCopy.push(itemWithId);
          return;
        }

        const group = thesaurusValuesCopy.find(groupItem => groupItem._id === itemWithId.groupId);
        if (group) {
          group.values = group.values || [];
          group.values.push(itemWithId);
        }
      });

      setThesaurusValues(thesaurusValuesCopy);
      return;
    }

    items.forEach(item => {
      if (!item.groupId) {
        const index = thesaurusValuesCopy.findIndex(tv => tv._id === item._id);
        thesaurusValuesCopy[index] = item;
        return;
      }

      const group = thesaurusValuesCopy.find(groupItem => groupItem._id === item.groupId);
      if (group) {
        const index = group.values?.findIndex(tv => tv._id === item._id);
        if (index !== undefined && index !== -1) {
          group.values = group.values || [];
          group.values[index] = item;
        }
      }
    });
    setThesaurusValues(thesaurusValuesCopy);
  };

  const addGroupSubmit = (group: FormThesauriValue) => {
    const thesaurusValuesCopy = thesaurusValues.filter(item => item._id !== group._id);
    setThesaurusValues([...thesaurusValuesCopy, group]);
  };

  const formSubmit: SubmitHandler<ClientThesaurus> = async data => {
    const sanitizedThesaurus = sanitizeThesaurusValues(data, thesaurusValues);
    try {
      const savedThesaurus = await ThesauriAPI.save(sanitizedThesaurus);
      setNotifications({
        type: 'success',
        text: thesaurus ? (
          <Translate>Thesauri updated.</Translate>
        ) : (
          <Translate>Thesauri added.</Translate>
        ),
      });
      navigate(`/settings/thesauri/edit/${savedThesaurus._id}`);
    } catch (e) {
      setNotifications({
        type: 'error',
        text: <Translate>Error updating thesauri.</Translate>,
      });
    }
  };

  return (
    <div
      className="tw-content"
      style={{ width: '100%', overflowY: 'auto' }}
      data-testid="settings-thesauri"
    >
      <SettingsContent className="flex flex-col h-full">
        <SettingsContent.Header
          path={new Map([['Thesauri', '/settings/thesauri']])}
          title={watch('name')}
        />
        <SettingsContent.Body>
          <form onSubmit={handleSubmit(formSubmit)} id="edit-thesaurus">
            <div data-testid="thesauri" className="rounded-md border border-gray-50 shadow-sm">
              <div className="p-4">
                <InputField
                  clearFieldAction={() => {}}
                  id="thesauri-name"
                  placeholder="Thesauri name"
                  className="mb-2"
                  hasErrors={!!errors.name}
                  {...register('name', { required: true })}
                />
              </div>
              <Table<TableThesaurusValue>
                draggableRows
                enableSelection
                subRowsKey="values"
                onChange={setThesaurusValues}
                columns={columns({ edit })}
                data={thesaurusValues}
                initialState={{ sorting: [{ id: 'label', desc: false }] }}
                onSelection={setSelectedThesaurusValue}
                allowEditGroupsWithDnD={false}
              />
            </div>
          </form>
        </SettingsContent.Body>
        <SettingsContent.Footer className="bottom-0 bg-indigo-50">
          {selectedThesaurusValue.length ? (
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                onClick={deleteSelected}
                color="error"
                data-testid="thesauri-remove-button"
              >
                <Translate>Remove</Translate>
              </Button>
              <Translate>Selected</Translate> {selectedThesaurusValue.length}{' '}
              <Translate>of</Translate> {thesaurusValues.length}
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <Button onClick={addItem}>
                  <Translate>Add item</Translate>
                </Button>
                <Button styling="outline" onClick={addGroup}>
                  <Translate>Add group</Translate>
                </Button>
                <Button styling="outline" onClick={sortValues}>
                  <Translate>Sort</Translate>
                </Button>
                <ImportButton
                  thesaurus={{ ...getValues(), values: thesaurusValues }}
                  onSuccess={(savedThesaurus: ThesaurusSchema) => {
                    setNotifications({
                      type: 'success',
                      text: <Translate>Thesauri updated.</Translate>,
                    });
                    navigate(`/settings/thesauri/edit/${savedThesaurus._id}`);
                  }}
                  onFailure={() => {
                    setNotifications({
                      type: 'error',
                      text: <Translate>Error adding thesauri.</Translate>,
                    });
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Link to="/settings/thesauri">
                  <Button styling="light" type="button">
                    <Translate>Cancel</Translate>
                  </Button>
                </Link>
                <Button styling="solid" color="success" type="submit" form="edit-thesaurus">
                  <Translate>Save</Translate>
                </Button>
              </div>
            </div>
          )}
        </SettingsContent.Footer>
      </SettingsContent>
      <ThesauriValueFormSidepanel
        showSidepanel={showThesauriValueFormSidepanel}
        submit={addItemSubmit}
        value={itemFormValues}
        closePanel={() => {
          setShowThesauriValueFormSidepanel(false);
        }}
        groups={thesaurusValues.filter((value: ClientThesaurusValue) =>
          Array.isArray(value.values)
        )}
      />
      <ThesauriGroupFormSidepanel
        showSidepanel={showThesauriGroupFormSidepanel}
        submit={addGroupSubmit}
        value={groupFormValues}
        closePanel={() => {
          setShowThesauriGroupFormSidepanel(false);
        }}
      />
      {showNavigationModal && (
        <ConfirmNavigationModal setShowModal={setShowNavigationModal} onConfirm={blocker.proceed} />
      )}
    </div>
  );
};

export { ThesaurusForm, editTheasaurusLoader };
