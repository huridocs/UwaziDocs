import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { fn } from '@storybook/test';
import { DateRangePicker } from 'app/V2/Components/Forms';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  args: {
    onFromDateSelected: fn(),
    onToDateSelected: fn(),
  },
  parameters: {
    actions: {
      handles: ['change'],
    },
  },
};

type Story = StoryObj<typeof DateRangePicker>;

const Primary: Story = {
  render: args => (
    <div className="tw-container">
      <div className="mx-2">
        <DateRangePicker
          className="mx-2"
          language={args.language}
          dateFormat={args.dateFormat}
          labelToday={args.labelToday}
          labelClear={args.labelClear}
          placeholderStart={args.placeholderStart}
          placeholderEnd={args.placeholderEnd}
          onFromDateSelected={args.onFromDateSelected}
          onToDateSelected={args.onToDateSelected}
        />
      </div>
    </div>
  ),
};

const Basic: Story = {
  ...Primary,
  args: {
    language: 'es',
    dateFormat: 'dd-mm-yyyy',
    labelToday: 'Hoy',
    labelClear: 'Limpiar',
    placeholderStart: 'Inicio',
    placeholderEnd: 'Fin',
    onFromDateSelected: action('changed'),
    onToDateSelected: action('blurred'),
  },
};

export { Basic };

export default meta;
