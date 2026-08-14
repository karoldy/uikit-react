import type { TableColumn } from '../types';
import { TableBody } from './TableBody';
import { TableCell } from './TableCell';
import { TableHeader } from './TableHeader';
import { TableHeaderCell } from './TableHeaderCell';
import { TableHeaderRow } from './TableHeaderRow';
import { TableRoot, type TableRootProps } from './TableRoot';
import { TableRow } from './TableRow';
import { TableChrome } from './table-chrome';

export interface TableProps<T> extends Omit<TableRootProps<T>, 'columns'> {
  columns: readonly TableColumn<T>[];
}

function TableDefault<T>(props: TableProps<T>) {
  return (
    <TableRoot {...props}>
      <TableChrome />
    </TableRoot>
  );
}

export const Table = Object.assign(TableDefault, {
  Root: TableRoot,
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});
