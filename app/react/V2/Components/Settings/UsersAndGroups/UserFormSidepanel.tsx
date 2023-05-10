/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoaderData } from 'react-router-dom';
import { Translate } from 'app/I18N';
import { ClientUserGroupSchema, ClientUserSchema } from 'app/apiResponseTypes';
import { InputField, Select } from 'V2/Components/Forms';
import { Button, Sidepanel } from 'V2/Components/UI';
import { UserRole } from 'shared/types/userSchema';

interface UserFormSidepanelProps {
  selectedUser?: ClientUserSchema;
  showSidepanel: boolean;
  setShowSidepanel: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: React.Dispatch<
    React.SetStateAction<ClientUserSchema | ClientUserGroupSchema | undefined>
  >;
}

const userRoles = [
  { key: UserRole.ADMIN, value: UserRole.ADMIN },
  { key: UserRole.EDITOR, value: UserRole.EDITOR },
  {
    key: UserRole.COLLABORATOR,
    value: UserRole.COLLABORATOR,
  },
];

const isUnique = (nameVal: string, selectedUser?: ClientUserSchema, users?: ClientUserSchema[]) =>
  !users?.find(
    existingUser =>
      existingUser._id !== selectedUser?._id &&
      (existingUser.username?.trim().toLowerCase() === nameVal.trim().toLowerCase() ||
        existingUser.email?.trim().toLowerCase() === nameVal.trim().toLowerCase())
  );

const UserFormSidepanel = ({
  selectedUser,
  showSidepanel,
  setShowSidepanel,
  setSelected,
}: UserFormSidepanelProps) => {
  const { users } = useLoaderData() as { users: ClientUserSchema[] };
  const defaultValues = {
    username: '',
    email: '',
    password: '',
    role: 'collaborator',
    groups: [],
  } as ClientUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues,
    values: selectedUser,
  });

  const closeSidePanel = () => {
    setSelected(undefined);
    reset(defaultValues);
    setShowSidepanel(false);
  };

  return (
    <Sidepanel
      isOpen={showSidepanel}
      withOverlay
      closeSidepanelFunction={closeSidePanel}
      title={selectedUser ? <Translate>Edit user</Translate> : <Translate>New user</Translate>}
    >
      <form
        onSubmit={handleSubmit(data => {
          console.log(data);
        })}
        className="flex flex-col h-full"
      >
        <div className="flex-grow">
          <fieldset className="mb-5 border rounded-md border-gray-50 shadow-sm">
            <Translate className="block w-full bg-gray-50 text-primary-700 font-semibold text-lg p-2">
              General Information
            </Translate>

            <div className="p-3">
              <div className="mb-4">
                <InputField
                  label={<Translate className="font-bold block mb-1">Username</Translate>}
                  id="username"
                  hasErrors={Boolean(errors.username)}
                  className="mb-1"
                  {...register('username', {
                    required: true,
                    validate: username => isUnique(username, selectedUser, users),
                    maxLength: 50,
                    minLength: 3,
                  })}
                />
                <span className="text-error-700 font-bold">
                  {errors.username?.type === 'required' && (
                    <Translate>Username is required</Translate>
                  )}
                  {errors.username?.type === 'validate' && (
                    <Translate>Duplicated username</Translate>
                  )}
                  {errors.username?.type === 'maxLength' && (
                    <Translate>Username is too long</Translate>
                  )}
                  {errors.username?.type === 'minLength' && (
                    <Translate>Username is too short</Translate>
                  )}
                </span>
              </div>

              <Select
                label={<Translate className="font-bold block mb-1">User Role</Translate>}
                className="mb-4"
                id="roles"
                options={userRoles}
                {...register('role')}
              />

              <div>
                <InputField
                  label={<Translate className="font-bold block mb-1">Email</Translate>}
                  type="email"
                  id="email"
                  className="mb-1"
                  hasErrors={Boolean(errors.email)}
                  {...register('email', {
                    required: true,
                    validate: email => isUnique(email, selectedUser, users),
                    maxLength: 256,
                  })}
                />
                <span className="text-error-700 font-bold">
                  {errors.email?.type === 'required' && <Translate>Email is required</Translate>}
                  {errors.email?.type === 'validate' && <Translate>Duplicated email</Translate>}
                </span>
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-5 border rounded-md border-gray-50 shadow-sm">
            <Translate className="block w-full bg-gray-50 text-primary-700 font-semibold text-lg p-2">
              Security
            </Translate>

            <div className="p-3">
              <InputField
                label={
                  <span className="font-bold mb-1">
                    <Translate>Password</Translate>
                  </span>
                }
                id="password"
                type="password"
                autoComplete="off"
                hasErrors={Boolean(errors.password)}
                className="mb-4"
                {...register('password', { maxLength: 50 })}
              />
              <span className="text-error-700 font-bold">
                {errors.password?.type === 'maxLength' && (
                  <Translate>Password is too long</Translate>
                )}
              </span>

              {selectedUser?._id && (
                <div className="flex flex-col gap-1 md:gap-4 md:flex-row md:justify-start">
                  <span className="shrink-0">
                    <Button
                      type="button"
                      buttonStyle="tertiary"
                      onClick={() => {
                        console.log('reset password');
                      }}
                    >
                      <Translate>Reset Password</Translate>
                    </Button>
                  </span>
                  <Translate>
                    Instructions will be sent to the user&apos;s email to reset the password
                  </Translate>
                </div>
              )}
            </div>
          </fieldset>

          <fieldset className="mb-5 border rounded-md border-gray-50 shadow-sm">
            <Translate className="block w-full bg-gray-50 text-primary-700 font-semibold text-lg p-2">
              Groups
            </Translate>
            <div className="p-3">content</div>
          </fieldset>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-grow"
            type="button"
            buttonStyle="secondary"
            onClick={closeSidePanel}
          >
            <Translate>Cancel</Translate>
          </Button>
          <Button className="flex-grow" type="submit" buttonStyle="primary">
            <Translate>Save</Translate>
          </Button>
        </div>
      </form>
    </Sidepanel>
  );
};

export { UserFormSidepanel };
