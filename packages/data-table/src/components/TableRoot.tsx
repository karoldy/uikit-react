import type { CSSProperties, Key, ReactNode } from 'react';
import type { ColumnBase } from '../types/column';
import type { SortState } from '../types/sorting';
import {
  DIV_FALLBACKS,
  NATIVE_FALLBACKS,
  type DataTableSlotProps,
  type DataTableSlots,
  type GetRowSpacing,
  type TableMarkup,
} from '../types/slots';
import { useSorting } from '../hooks/use-sorting';
import { cx } from '../utils/cx';
import { getStickyOffsets } from '../utils/sticky';
import { renderSlot } from './render-slot';
import { defaultSlotClass } from './default-slot-class';
import { TableContext, type TableContextValue } from './table-context';

const defaultIndicator = (_direction: SortState['direction']): ReactNode => null;

export interface TableRootProps<T> {
  markup: TableMarkup;
  data: readonly T[];
  columns: readonly ColumnBase<T>[];
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  getRowSpacing?: GetRowSpacing<T>;
  getRowKey?: (row: T, index: number) => Key;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  renderSortIndicator?: (direction: SortState['direction']) => ReactNode;
  disableDefaultStyles?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  rowHeight?: number;
  overscan?: number;
  height?: number;
}

export function TableRoot<T>({
  markup,
  data,
  columns,
  sort,
  defaultSort,
  onSortChange,
  getRowSpacing,
  getRowKey,
  slots,
  slotProps,
  renderSortIndicator = defaultIndicator,
  disableDefaultStyles = false,
  className,
  style,
  children,
  rowHeight,
  overscan,
  height,
  ...props
}: TableRootProps<T>) {
  const {
    sortedRows,
    sort: sortState,
    toggleSort,
    getSortDirection,
  } = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });
  const stickyOffsets = getStickyOffsets(columns);
  const fallbacks = markup === 'native' ? NATIVE_FALLBACKS : DIV_FALLBACKS;
  const configured = (slotProps?.root ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const virtualStyle: CSSProperties | undefined =
    rowHeight !== undefined
      ? { height: height ?? 300, overflowY: 'auto', minHeight: 0 }
      : undefined;

  return (
    <TableContext.Provider
      value={
        {
          markup,
          fallbacks,
          columns,
          sortedRows,
          sort: sortState,
          toggleSort,
          getSortDirection,
          stickyOffsets,
          getRowSpacing,
          getRowKey,
          renderSortIndicator,
          slots,
          slotProps,
          disableDefaultStyles,
          rowHeight,
          overscan,
          height,
        } as TableContextValue
      }
    >
      {renderSlot(
        slots?.root,
        fallbacks.root,
        {
          ...props,
          ...configured,
          className: cx(
            defaultSlotClass(disableDefaultStyles, slots?.root, 'uikit-dt'),
            configured.className as string | undefined,
            className,
          ),
          style: {
            ...virtualStyle,
            ...style,
            ...configuredStyle,
          },
        },
        children,
      )}
    </TableContext.Provider>
  );
}
