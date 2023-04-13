import React from 'react';
import { UseFormGetFieldState, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Translate } from 'app/I18N';
import { InputField } from '../UI';

type fromPropsType = {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  getFieldState: UseFormGetFieldState<any>;
  submitting: boolean;
};

const FormInput = (data: any, formProps: fromPropsType) => {
  const { register, setValue, submitting, getFieldState } = formProps;
  const { error } = getFieldState(data.cell.value);
  const hasErrors = Boolean(error);
  const reset = () => setValue(data.cell.value, '', { shouldDirty: true });
  return (
    <div>
      <InputField
        fieldID={data.cell.value}
        label={data.cell.row.values.language}
        hideLabel
        disabled={submitting}
        clearFieldAction={reset}
        hasErrors={hasErrors}
        fieldControls={{
          ...register(data.cell.value, {
            required: true,
          }),
        }}
      />
      {hasErrors && (
        <div className="mt-2 text-error-700 font-bold">
          <Translate>This field is required</Translate>
        </div>
      )}
    </div>
  );
};

export { FormInput };
