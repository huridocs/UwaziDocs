/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Translate } from 'app/I18N';
import { Button } from 'V2/Components/UI';
import { PXTable } from '../types';
import { TableTitle } from './TableTitle';
import { DisplayPill } from './DisplayPills';

const extractorColumnHelper = createColumnHelper<PXTable>();

const TableHeaderContainer = ({ children }: { children: React.ReactNode }) => (
  <span className="text-gray-500 font-semibold text-xs">{children}</span>
);

const SourceTemplateHeader = () => (
  <TableHeaderContainer>
    <Translate>Source Template</Translate>
  </TableHeaderContainer>
);
const TargetTemplateHeader = () => (
  <TableHeaderContainer>
    <Translate>Target Template</Translate>
  </TableHeaderContainer>
);
const EntitiesCountHeader = () => (
  <TableHeaderContainer>
    <Translate>Entities</Translate>
  </TableHeaderContainer>
);
const ActionHeader = () => <TableHeaderContainer> </TableHeaderContainer>;

const NumericCell = ({
  cell,
}: CellContext<PXTable, PXTable['documents'] | PXTable['generatedEntities']>) => (
  <span className="text-sm font-normal text-gray-500">{cell.getValue()}</span>
);

const TemplatesCell = ({ cell }: CellContext<PXTable, PXTable['targetTemplate']>) => (
  <div className="flex flex-wrap gap-2">
    <div className="whitespace-nowrap">
      <DisplayPill color={cell.getValue().color}>
        <span className="text-xs font-medium">{cell.getValue().name}</span>
      </DisplayPill>
    </div>
  </div>
);

const SourceTemplateCell = ({ cell }: CellContext<PXTable, PXTable['sourceTemplates']>) => (
  <div className="flex flex-wrap gap-2">
    {cell.getValue().map(({ name, color, _id }) => (
      <div key={_id} className="whitespace-nowrap">
        <DisplayPill color={color}>
          <span className="text-xs font-medium">{name}</span>
        </DisplayPill>
      </div>
    ))}
  </div>
);

const ActionButtons = ({ cell }: CellContext<PXTable, PXTable['_id']>) => (
  <div className="flex gap-2 justify-end">
    <Link to={`${cell.getValue()}/entities`}>
      <Button className="leading-4" styling="outline">
        <Translate>View</Translate>
      </Button>
    </Link>
  </div>
);

const tableColumns = [
  extractorColumnHelper.accessor('sourceTemplates', {
    header: SourceTemplateHeader,
    enableSorting: true,
    cell: SourceTemplateCell,
    meta: {
      headerClassName: 'w-1/4',
    },
  }),
  extractorColumnHelper.accessor('targetTemplate', {
    header: TargetTemplateHeader,
    enableSorting: true,
    cell: TemplatesCell,
    meta: {
      headerClassName: 'w-1/4',
    },
  }),
  extractorColumnHelper.accessor('generatedEntities', {
    header: EntitiesCountHeader,
    enableSorting: true,
    cell: NumericCell,
    meta: {
      headerClassName: 'w-1/4',
    },
  }),
  extractorColumnHelper.accessor('_id', {
    header: ActionHeader,
    enableSorting: false,
    cell: ActionButtons,
  }),
];

const NoDataMessage = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <Translate className="text-gray-500 font-semibold text-xs">NO EXTRACTORS</Translate>.
  </div>
);

export { tableColumns, TableTitle, NoDataMessage };
