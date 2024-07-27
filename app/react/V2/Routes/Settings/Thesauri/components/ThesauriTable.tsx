import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Translate } from 'app/I18N';
import { Table } from 'app/V2/Components/UI';
import { ClientThesaurus, Template } from 'app/apiResponseTypes';
import { ObjectIdSchema } from 'shared/types/commonTypes';
import {
  EditButton,
  LabelHeader,
  ActionHeader,
  TemplateHeader,
  ThesaurusLabel,
  templatesCells,
} from './TableComponents';

interface ThesauriRow extends ClientThesaurus {
  _id: ObjectIdSchema;
  rowId: string;
  disableRowSelection?: boolean;
  templates: Template[];
}

interface ThesauriTableProps {
  currentThesauri: ThesauriRow[];
  setSelectedThesauri: React.Dispatch<React.SetStateAction<ThesauriRow[]>>;
}

const ThesauriTable = ({ currentThesauri, setSelectedThesauri }: ThesauriTableProps) => {
  const navigate = useNavigate();
  const navigateToEditThesaurus = (thesaurus: Row<ThesauriRow>) => {
    navigate(`./edit/${thesaurus.original._id}`);
  };
  const columnHelper = createColumnHelper<any>();
  const columns = ({ edit }: { edit: Function }) => [
    columnHelper.accessor('name', {
      id: 'name',
      header: LabelHeader,
      cell: ThesaurusLabel,
      meta: { headerClassName: 'w-6/12 font-medium' },
    }) as ColumnDef<ThesauriRow, 'name'>,
    columnHelper.accessor('templates', {
      header: TemplateHeader,
      cell: templatesCells,
      enableSorting: false,
      meta: { headerClassName: 'w-6/12' },
    }) as ColumnDef<ThesauriRow, 'templates'>,
    columnHelper.accessor('_id', {
      header: ActionHeader,
      cell: EditButton,
      enableSorting: false,
      meta: { action: edit, headerClassName: 'w-0 text-center sr-only' },
    }) as ColumnDef<ThesauriRow, '_id'>,
  ];

  return (
    <Table
      data={currentThesauri}
      columns={columns({ edit: navigateToEditThesaurus })}
      defaultSorting={[{ id: 'name', desc: false }]}
      onChange={({ selectedRows }) => {
        const selectedIds = Object.keys(selectedRows);
        const selection = currentThesauri.filter(thesaurus =>
          selectedIds.includes(thesaurus.rowId)
        );
        setSelectedThesauri(selection);
      }}
      enableSelections
      header={
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-lg">
            <Translate>Thesauri</Translate>
          </h2>
        </div>
      }
    />
  );
};

export type { ThesauriRow };
export { ThesauriTable };
