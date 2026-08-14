import type { DataTableColumn } from '../types';
import { TableBody } from './TableBody';
import { TableCell } from './TableCell';
import { TableHeader } from './TableHeader';
import { TableHeaderCell } from './TableHeaderCell';
import { TableHeaderRow } from './TableHeaderRow';
import { TableRoot, type TableRootProps } from './TableRoot';
import { TableRow } from './TableRow';
import { TableChrome } from './table-chrome';

export interface DataTableProps<T> extends Omit<TableRootProps<T>, 'markup' | 'columns'> {
  columns: readonly DataTableColumn<T>[];
}

function DivRoot<T>(props: Omit<TableRootProps<T>, 'markup'>) {
  return <TableRoot {...props} markup="div" />;
}

function DataTableDefault<T>(props: DataTableProps<T>) {
  return (
    <TableRoot {...props} markup="div">
      <TableChrome />
    </TableRoot>
  );
}

export const DataTable = Object.assign(DataTableDefault, {
  Root: DivRoot,
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});
