import type { TableHeaderCellSlotProps, TableCellSlotProps, TableRowSlotProps } from '../src/types';

export function TestHeaderCell({
  label,
  sorted: _sorted,
  sortable: _sortable,
  column: _column,
  fixed: _fixed,
  children,
  ...props
}: TableHeaderCellSlotProps) {
  return (
    <div aria-label={typeof label === 'string' ? label : undefined} {...props}>
      {children}
    </div>
  );
}

export function TestCell({
  value,
  row: _row,
  index: _index,
  column: _column,
  children,
  ...props
}: TableCellSlotProps) {
  return (
    <div aria-label={value === undefined || value === null ? undefined : String(value)} {...props}>
      {children}
    </div>
  );
}

export function TestRow({ row: _row, index: _index, children, ...props }: TableRowSlotProps) {
  return <div {...props}>{children}</div>;
}

export const testSlots = {
  headerCell: TestHeaderCell,
  cell: TestCell,
  row: TestRow,
};
