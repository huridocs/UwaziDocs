import React from 'react';
import { HeaderGroup, flexRender } from '@tanstack/react-table';
import { getIcon } from './TableElements';

interface RowProps<T> {
  headerGroup: HeaderGroup<T>;
  draggableRows: boolean;
}
/* eslint-disable comma-spacing */
const TableHeader = <T,>({ headerGroup, draggableRows }: RowProps<T>) => (
  <tr>
    {headerGroup.headers.map(header => {
      const isSortable = header.column.getCanSort();
      const isSelect = header.column.id === 'checkbox-select';
      const headerClassName = `${draggableRows ? 'pl-7' : ''} ${isSelect ? 'px-2' : 'px-6'} py-3 ${
        header.column.columnDef.meta?.headerClassName || ''
      }`;

      return (
        <th key={header.id} scope="col" className={headerClassName}>
          <div
            className={`inline-flex ${isSortable ? 'cursor-pointer select-none' : ''}`}
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {isSortable && getIcon(header.column.getIsSorted())}
          </div>
        </th>
      );
    })}
  </tr>
);

export { TableHeader };
