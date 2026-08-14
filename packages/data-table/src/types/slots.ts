import type { ElementType, ReactNode } from 'react';
import type { SortDirection } from '@uikit-react/hooks';
import type { ColumnBase } from './column';

export type SlotPropsOf = Record<string, unknown>;

export interface DataTableSlots {
  root?: ElementType;
  header?: ElementType;
  headerRow?: ElementType;
  headerCell?: ElementType;
  body?: ElementType;
  row?: ElementType;
  cell?: ElementType;
  loadingRow?: ElementType;
  loadingCell?: ElementType;
  loadingLine?: ElementType;
  loadingSpin?: ElementType;
}

export interface DataTableSlotProps {
  root?: SlotPropsOf;
  header?: SlotPropsOf;
  headerRow?: SlotPropsOf;
  headerCell?: SlotPropsOf;
  body?: SlotPropsOf;
  row?: SlotPropsOf;
  cell?: SlotPropsOf;
  loadingRow?: SlotPropsOf;
  loadingCell?: SlotPropsOf;
  loadingLine?: SlotPropsOf;
  loadingSpin?: SlotPropsOf;
}

export interface TableFallbacks {
  root: ElementType;
  header: ElementType;
  headerRow: ElementType;
  headerCell: ElementType;
  body: ElementType;
  row: ElementType;
  cell: ElementType;
}

export const DIV_FALLBACKS: TableFallbacks = {
  root: 'div',
  header: 'div',
  headerRow: 'div',
  headerCell: 'div',
  body: 'div',
  row: 'div',
  cell: 'div',
};

export interface TableHeaderCellSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  column: ColumnBase<unknown>;
  label: ReactNode;
  sortable: boolean;
  sorted: SortDirection | false;
  fixed: 'left' | 'right' | false;
}

export interface TableRowSlotProps<T = unknown> extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  row: T;
  index: number;
}

export interface TableCellSlotProps<T = unknown> extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  row: T;
  index: number;
  column: ColumnBase<unknown>;
  value: unknown;
}

export interface TableLoadingRowSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  count: number;
  columns: readonly ColumnBase<unknown>[];
}

export type TableLoadingCellSlotProps = TableLoadingRowSlotProps;

export interface TableLoadingLineSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
}

export interface TableLoadingSpinSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
}

export interface RowSpacingContext<T> {
  row: T;
  index: number;
}

export type GetRowSpacing<T> = (context: RowSpacingContext<T>) => {
  top: number;
  bottom: number;
};
