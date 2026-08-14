import type { CSSProperties, Key, ReactNode } from 'react';
import type { Accessor, SortState, SortStateInput } from '@uikit-react/hooks';

export type VirtualTableColumn<T> =
  | (VirtualTableColumnBase<T> & { width: number; flex?: never })
  | (VirtualTableColumnBase<T> & { width?: never; flex: number });

interface VirtualTableColumnBase<T> {
  key: string;
  accessor: Accessor<T>;
  header: ReactNode;
  sortable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  fixed?: 'left' | 'right';
  renderCell?: (ctx: {
    row: T;
    value: unknown;
    column: VirtualTableColumn<T>;
    index: number;
  }) => ReactNode;
  renderHeaderCell?: (ctx: { column: VirtualTableColumn<T> }) => ReactNode;
}

export interface RowSpacing {
  top: number;
  bottom: number;
}

export type GetRowSpacing<T> = (context: { row: T; index: number }) => RowSpacing;

export interface VirtualTableProps<T> {
  data: readonly T[];
  columns: readonly VirtualTableColumn<T>[];
  rowHeight: number;
  height?: number;
  overscan?: number;
  headerHeight?: number;
  getRowSpacing?: GetRowSpacing<T>;
  sort?: SortStateInput;
  defaultSort?: SortStateInput;
  onSortChange?: (sort: SortState) => void;
  multiSort?: boolean;
  getRowKey?: (row: T, index: number) => Key;
  className?: string;
  style?: CSSProperties;
}
