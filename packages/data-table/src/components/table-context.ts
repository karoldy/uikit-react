import { createContext, useContext, type Key, type ReactNode } from 'react';
import type { SortDirection, SortState, UseSortingReturn } from '@uikit-react/hooks';
import type { ColumnBase } from '../types/column';
import type {
  DataTableSlotProps,
  DataTableSlots,
  GetRowSpacing,
  TableFallbacks,
} from '../types/slots';
import type { TableLoading } from '../types/loading';

export interface TableContextValue<T = unknown> {
  fallbacks: TableFallbacks;
  columns: readonly ColumnBase<T>[];
  sortedRows: T[];
  sort: SortState;
  toggleSort: UseSortingReturn<T>['toggleSort'];
  getSortDirection: UseSortingReturn<T>['getSortDirection'];
  stickyOffsets: Map<string, { left?: number; right?: number }>;
  getRowSpacing?: GetRowSpacing<T>;
  getRowKey?: (row: T, index: number) => Key;
  renderSortIndicator: (direction: SortDirection | undefined) => ReactNode;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  disableDefaultStyles: boolean;
  loading: TableLoading | false;
  skeletonRows?: number;
}

export const TableContext = createContext<TableContextValue | null>(null);

export function useTableContext<T = unknown>(): TableContextValue<T> {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error(
      'Table compound components must be used within <Table.Root> or <DataTable.Root>',
    );
  }
  return context as TableContextValue<T>;
}
