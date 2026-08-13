import { createContext, useContext, type Key, type ReactNode } from 'react';
import type { UseSortingReturn } from '../hooks/use-sorting';
import type { ColumnBase } from '../types/column';
import type {
  DataTableSlotProps,
  DataTableSlots,
  GetRowSpacing,
  TableFallbacks,
  TableMarkup,
} from '../types/slots';
import type { SortState } from '../types/sorting';

export interface TableContextValue<T = unknown> {
  markup: TableMarkup;
  fallbacks: TableFallbacks;
  columns: readonly ColumnBase<T>[];
  sortedRows: T[];
  sort: SortState;
  toggleSort: UseSortingReturn<T>['toggleSort'];
  getSortDirection: UseSortingReturn<T>['getSortDirection'];
  stickyOffsets: Map<string, { left?: number; right?: number }>;
  getRowSpacing?: GetRowSpacing<T>;
  getRowKey?: (row: T, index: number) => Key;
  renderSortIndicator: (direction: SortState['direction']) => ReactNode;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  disableDefaultStyles: boolean;
  rowHeight?: number;
  overscan?: number;
  height?: number;
}

export const TableContext = createContext<TableContextValue | null>(null);

export function useTableContext<T = unknown>(): TableContextValue<T> {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error(
      'Table compound components must be used within <Table.Root>, <DataTable.Root>, or <VirtualTable.Root>',
    );
  }
  return context as TableContextValue<T>;
}
