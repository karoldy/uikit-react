import type { CSSProperties, Key, ReactNode } from 'react';
import type { SortDirection, SortState, SortStateInput } from '@uikit-react/hooks';
import { useSorting } from '@uikit-react/hooks';
import type { ColumnBase } from '../types/column';
import {
  DIV_FALLBACKS,
  NATIVE_FALLBACKS,
  type DataTableSlotProps,
  type DataTableSlots,
  type GetRowSpacing,
  type TableMarkup,
} from '../types/slots';
import { cx } from '../utils/cx';
import { getStickyOffsets } from '../utils/sticky';
import { renderSlot } from './render-slot';
import { defaultSlotClass } from './default-slot-class';
import { TableContext, type TableContextValue } from './table-context';

const defaultIndicator = (_direction: SortDirection | undefined): ReactNode => null;

export interface TableRootProps<T> {
  markup: TableMarkup;
  data: readonly T[];
  columns: readonly ColumnBase<T>[];
  sort?: SortStateInput;
  defaultSort?: SortStateInput;
  onSortChange?: (sort: SortState) => void;
  /** 为 true 时单击也走多列排序；Shift+click 始终追加 */
  multiSort?: boolean;
  getRowSpacing?: GetRowSpacing<T>;
  getRowKey?: (row: T, index: number) => Key;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  renderSortIndicator?: (direction: SortDirection | undefined) => ReactNode;
  disableDefaultStyles?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function TableRoot<T>({
  markup,
  data,
  columns,
  sort,
  defaultSort,
  onSortChange,
  multiSort,
  getRowSpacing,
  getRowKey,
  slots,
  slotProps,
  renderSortIndicator = defaultIndicator,
  disableDefaultStyles = false,
  className,
  style,
  children,
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
    multiSort,
  });
  const stickyOffsets = getStickyOffsets(columns);
  const fallbacks = markup === 'native' ? NATIVE_FALLBACKS : DIV_FALLBACKS;
  const configured = (slotProps?.root ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

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
            ...style,
            ...configuredStyle,
          },
        },
        children,
      )}
    </TableContext.Provider>
  );
}
