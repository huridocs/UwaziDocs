import React from 'react';
import { HeaderGroup, flexRender } from '@tanstack/react-table';
import { getIcon } from './TableElements';

interface RowProps<T> {
  headerGroup: HeaderGroup<T>;
  draggableRows: boolean;
  sortedChanged: boolean;
}
/* eslint-disable comma-spacing */
const TableHeader = <T,>({ headerGroup, draggableRows, sortedChanged }: RowProps<T>) => (
  <tr className="border-b">
    {headerGroup.headers.map(header => {
      const isSortable = header.column.getCanSort();
      const isSelect = header.column.id === 'checkbox-select';
      const commonHeaderClassName = `${draggableRows ? 'pl-7' : ''} ${
        isSelect ? 'w-0 px-4 py-3' : 'px-6 py-3'
      }`;

      const headerClassName = `${!header.column.columnDef.meta?.headerClassName?.includes('invisible') ? commonHeaderClassName : ''} ${header.column.columnDef.meta?.headerClassName || ''}`;

      return (
        <th key={header.id} scope="col" className={headerClassName}>
          <div
            className={`inline-flex ${isSortable ? 'cursor-pointer select-none' : ''}`}
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {isSortable && getIcon(header, sortedChanged)}
          </div>
        </th>
      );
    })}
  </tr>
);

export { TableHeader };
