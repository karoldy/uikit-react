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
}

export interface DataTableSlotProps {
  root?: SlotPropsOf;
  header?: SlotPropsOf;
  headerRow?: SlotPropsOf;
  headerCell?: SlotPropsOf;
  body?: SlotPropsOf;
  row?: SlotPropsOf;
  cell?: SlotPropsOf;
}

export type TableMarkup = 'native' | 'div';

export interface TableFallbacks {
  root: ElementType;
  header: ElementType;
  headerRow: ElementType;
  headerCell: ElementType;
  body: ElementType;
  row: ElementType;
  cell: ElementType;
}

export const NATIVE_FALLBACKS: TableFallbacks = {
  root: 'table',
  header: 'thead',
  headerRow: 'tr',
  headerCell: 'th',
  body: 'tbody',
  row: 'tr',
  cell: 'td',
};

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

export interface RowSpacingContext<T> {
  row: T;
  index: number;
}

export type GetRowSpacing<T> = (context: RowSpacingContext<T>) => {
  top: number;
  bottom: number;
};
