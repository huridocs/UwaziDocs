import React, { useEffect, useMemo, useState } from 'react';
import {
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  SortingState,
  Row,
} from '@tanstack/react-table';
import type { IDraggable } from 'app/V2/shared/types';
import { TableProps, CheckBoxHeader, CheckBoxCell } from './TableElements';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TableRow } from './TableRow';
import { useDnDTable } from './useDnDTable';

const applyForSelection = (
  withSelection: any,
  withOutSelection: any,
  enableSelection: boolean = false
) => (enableSelection ? withSelection : withOutSelection);

// eslint-disable-next-line comma-spacing, max-statements
const Table = <T,>({
  columns,
  data,
  title,
  footer,
  initialState,
  enableSelection,
  sorting,
  setSorting,
  onSelection,
  draggableRows = false,
  onChange = () => {},
}: TableProps<T>) => {
  const manualSorting = Boolean(setSorting);
  const [internalSorting, setInternalSortingSorting] = useState<SortingState>(
    initialState?.sorting || []
  );

  const [rowSelection, setRowSelection] = useState({});
  const [rowData, setRowData] = useState<Row<T>[] | IDraggable<Row<T>>[]>();
  const memoizedColumns = useMemo(
    () => [
      ...applyForSelection(
        [
          {
            ...{
              id: 'checkbox-select',
              header: CheckBoxHeader,
              cell: CheckBoxCell,
            },
            className: 'w-0',
          },
        ],
        [],
        enableSelection
      ),
      ...columns,
    ],
    [columns, enableSelection]
  );

  const sortingState = manualSorting ? sorting : internalSorting;
  const sortingFunction = manualSorting ? setSorting : setInternalSortingSorting;

  const preparedData = useMemo<T[]>(() => {
    setRowSelection({});
    return data;
  }, [data]);

  const table = useReactTable({
    columns: memoizedColumns,
    manualSorting,
    data: preparedData,
    initialState,
    state: {
      sorting: sortingState,
      ...applyForSelection({ rowSelection }, {}, enableSelection),
    },
    enableRowSelection: enableSelection,
    onRowSelectionChange: applyForSelection(setRowSelection, () => undefined, enableSelection),
    onSortingChange: sortingFunction,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { activeItems, dndContext, setReset } = useDnDTable<T>(
    draggableRows,
    (row: any) => row.getValue('id'),
    table,
    sortingState,
    onChange
  );

  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().flatRows;

    if (onSelection) {
      onSelection(selectedRows);
    }
  }, [onSelection, rowSelection, table]);

  useEffect(() => {
    dndContext.updateActiveItems(table.getRowModel().rows);
    setReset(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preparedData]);

  useEffect(() => {
    if (draggableRows) {
      setRowData(activeItems);
    } else {
      setRowData(table.getRowModel().rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems, draggableRows]);

  return (
    <div className="relative overflow-x-auto border rounded-md shadow-sm border-gray-50">
      <table className="w-full text-sm text-left" data-testid="table">
        {title && (
          <caption className="p-4 text-base font-semibold text-left text-gray-900 bg-white">
            {title}
          </caption>
        )}

        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <TableHeader
              key={headerGroup.id}
              headerGroup={headerGroup}
              draggableRows={draggableRows}
            />
          ))}
        </thead>
        <TableBody draggableRows>
          {(rowData || table.getRowModel().rows).map(
            (item: Row<T> | IDraggable<Row<T>>, index: number) => (
              <TableRow
                key={item.id}
                item={item}
                draggableRow={draggableRows === true}
                index={index}
                dndContext={dndContext}
              />
            )
          )}
        </TableBody>
      </table>
      {footer && <div className="p-4">{footer}</div>}
    </div>
  );
};
export { Table };
