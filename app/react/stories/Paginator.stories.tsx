import React from 'react';
import { Provider } from 'react-redux';
import type { Meta, StoryObj } from '@storybook/react';
import { Paginator } from 'app/V2/Components/UI';
import { LEGACY_createStore as createStore } from 'V2/shared/testingHelpers';

const meta: Meta<typeof Paginator> = {
  title: 'Components/Paginator',
  component: Paginator,
  argTypes: {},
  //   parameters: {
  //     actions: {
  //       handles: ['change'],
  //     },
  //   },
};

type Story = StoryObj<typeof Paginator>;

const Primary: Story = {
  render: args => (
    <Provider store={createStore()}>
      <div className="tw-content">
        <div className="container w-10 h-10">
          <Paginator
            currentPage={args.currentPage}
            totalPages={args.totalPages}
            pathname={args.pathname}
            otherParams={args.otherParams}
          />
        </div>
      </div>
    </Provider>
  ),
};

const Basic: Story = {
  ...Primary,
  args: { currentPage: '8', totalPages: '576', pathname: 'somepath', otherParams: '' },
};

export { Basic };

export default meta;
