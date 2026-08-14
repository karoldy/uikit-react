import type { CSSProperties, Key, ReactNode } from 'react';
import type { SortDirection, SortState, SortStateInput } from '@uikit-react/hooks';
import { useSorting } from '@uikit-react/hooks';
import type { ColumnBase } from '../types/column';
import {
  DIV_FALLBACKS,
  type DataTableSlotProps,
  type DataTableSlots,
  type GetRowSpacing,
} from '../types/slots';
import { resolveLoading, type TableLoading } from '../types/loading';
import { cx } from '../utils/cx';
import { getStickyOffsets } from '../utils/sticky';
import { renderSlot } from './render-slot';
import { defaultSlotClass } from './default-slot-class';
import { TableContext, type TableContextValue } from './table-context';

const defaultIndicator = (_direction: SortDirection | undefined): ReactNode => null;

export interface TableRootProps<T> {
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
  /** 是否画单元格边框。默认 true；相邻边框合并为 1px */
  bordered?: boolean;
  /**
   * 加载态：`row` 整行骨架、`cell` 按单元格骨架、`line` 表头底运动线、`spin` Body 中央转圈。
   * 无数据时 `line` 回退为 `row`；`spin` 无数据、有数据都可用。
   */
  loading?: TableLoading | false;
  /** 骨架行数。无数据默认 12；有数据且 row/cell 时默认等于 data.length */
  skeletonRows?: number;
  disableDefaultStyles?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function TableRoot<T>({
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
  bordered = true,
  loading,
  skeletonRows,
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
  const fallbacks = DIV_FALLBACKS;
  const resolvedLoading = resolveLoading(loading, data.length > 0);
  const configured = (slotProps?.root ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  return (
    <TableContext.Provider
      value={
        {
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
          loading: resolvedLoading,
          skeletonRows,
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
            defaultSlotClass(
              disableDefaultStyles,
              slots?.root,
              !bordered && 'uikit-dt--borderless',
            ),
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
