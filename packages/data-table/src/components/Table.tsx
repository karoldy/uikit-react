import type { TableColumn } from '../types';
import { TableBody } from './TableBody';
import { TableCell } from './TableCell';
import { TableHeader } from './TableHeader';
import { TableHeaderCell } from './TableHeaderCell';
import { TableHeaderRow } from './TableHeaderRow';
import { TableRoot, type TableRootProps } from './TableRoot';
import { TableRow } from './TableRow';
import { TableChrome } from './table-chrome';

export interface TableProps<T> extends Omit<TableRootProps<T>, 'markup' | 'columns'> {
  columns: readonly TableColumn<T>[];
}

function NativeRoot<T>(props: Omit<TableRootProps<T>, 'markup'>) {
  return <TableRoot {...props} markup="native" />;
}

function TableDefault<T>(props: TableProps<T>) {
  return (
    <TableRoot {...props} markup="native">
      <TableChrome />
    </TableRoot>
  );
}

export const Table = Object.assign(TableDefault, {
  Root: NativeRoot,
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});
