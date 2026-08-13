import type { VirtualTableColumn } from '../types';
import { TableBody } from './TableBody';
import { TableCell } from './TableCell';
import { TableHeader } from './TableHeader';
import { TableHeaderCell } from './TableHeaderCell';
import { TableHeaderRow } from './TableHeaderRow';
import { TableRoot, type TableRootProps } from './TableRoot';
import { TableRow } from './TableRow';
import { TableChrome } from './table-chrome';

export interface VirtualTableProps<T> extends Omit<
  TableRootProps<T>,
  'markup' | 'columns' | 'rowHeight'
> {
  columns: readonly VirtualTableColumn<T>[];
  rowHeight: number;
}

function VirtualRoot<T>(props: Omit<TableRootProps<T>, 'markup'> & { rowHeight: number }) {
  return <TableRoot {...props} markup="div" />;
}

function VirtualTableDefault<T>(props: VirtualTableProps<T>) {
  return (
    <TableRoot {...props} markup="div">
      <TableChrome />
    </TableRoot>
  );
}

export const VirtualTable = Object.assign(VirtualTableDefault, {
  Root: VirtualRoot,
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});
