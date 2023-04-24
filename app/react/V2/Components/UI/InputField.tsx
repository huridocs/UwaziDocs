import { Translate } from 'app/I18N';
import React, { ChangeEventHandler, Ref } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface InputFieldProps {
  fieldID?: string;
  label?: string | React.ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: ChangeEventHandler<HTMLInputElement>;
  name?: string;
  ref?: Ref<any>;
  value?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  placeholder?: string;
  hasErrors?: boolean;
  clearFieldAction?: () => any;
  className?: string;
}

const InputField = React.forwardRef(
  (
    {
      fieldID,
      label,
      disabled,
      hideLabel,
      placeholder,
      hasErrors,
      value,
      clearFieldAction,
      className,
      onChange = () => {},
      onBlur = () => {},
      name = '',
    }: InputFieldProps,
    ref: Ref<any>
  ) => {
    const hasClearFieldButton = Boolean(clearFieldAction);
    let fieldStyles = 'border-gray-300 border text-gray-900';
    let clearFieldStyles = 'enabled:hover:text-primary-700 text-gray-900';

    if (hasErrors) {
      fieldStyles =
        'border-error-300 focus:border-error-500 focus:ring-error-500 border-2 text-red-900';
      clearFieldStyles = 'enabled:hover:text-error-700 text-error-900';
    }

    if (hasClearFieldButton) {
      fieldStyles = `${fieldStyles} pr-10`;
    }

    return (
      <div className={className}>
        <label htmlFor={fieldID} className={hideLabel ? 'sr-only' : ''}>
          {label}
        </label>
        <div className="relative w-full">
          <input
            type="text"
            id={fieldID}
            onChange={onChange}
            onBlur={onBlur}
            name={name}
            ref={ref}
            disabled={disabled}
            value={value}
            className={`${fieldStyles} disabled:text-gray-500 rounded-lg bg-gray-50 block flex-1 w-full text-sm p-2.5`}
            placeholder={placeholder}
          />
          {hasClearFieldButton && (
            <button
              type="button"
              onClick={clearFieldAction}
              disabled={disabled}
              data-testid="clear-field-button"
              className={`${clearFieldStyles} top-px disabled:text-gray-500 absolute p-2.5 right-0 text-sm font-medium rounded-r-lg
             focus:outline-none`}
            >
              <XMarkIcon className="w-5" />
              <Translate className="sr-only">Clear</Translate>
            </button>
          )}
        </div>
      </div>
    );
  }
);

export { InputField };
