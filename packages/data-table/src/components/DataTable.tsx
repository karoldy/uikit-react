import type { CSSProperties, ReactNode } from 'react';
import type {
  DataTableColumn,
  DataTableSlotProps,
  DataTableSlots,
  GetRowSpacing,
  SortState,
} from '../types';
import { useSorting } from '../hooks/use-sorting';
import { cx } from '../utils/cx';
import { getStickyOffsets, getStickyStyle } from '../utils/sticky';
import { getValue } from '../utils/get-value';

export interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  /** 受控排序状态 */
  sort?: SortState;
  /** 非受控初始排序状态 */
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** 行间距(px),作用于行 div 的 paddingTop/paddingBottom */
  getRowSpacing?: GetRowSpacing<T>;
  /** 可替换内部元素: root / headerRow / row / cell */
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  /** 排序方向指示器,缺省 ↑/↓/⇅ */
  renderSortIndicator?: (direction: SortState['direction']) => ReactNode;
  /** 外层容器 className */
  className?: string;
  style?: CSSProperties;
}

const defaultIndicator = (direction: SortState['direction']): ReactNode =>
  direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '⇅';

/** 单列布局样式: flex 列按 grow 伸缩(width 作基础宽度),定宽列固定 */
function columnStyle<T>(
  column: DataTableColumn<T>,
  stickyStyle: CSSProperties | undefined,
): CSSProperties {
  const style: CSSProperties = {};
  if (column.flex !== undefined) {
    style.flexGrow = column.flex;
    style.flexShrink = 1;
    style.flexBasis = column.width !== undefined ? `${column.width}px` : '0px';
  } else {
    style.flex = '0 0 auto';
    if (column.width !== undefined) style.width = `${column.width}px`;
  }
  if (column.minWidth !== undefined) style.minWidth = `${column.minWidth}px`;
  if (column.maxWidth !== undefined) style.maxWidth = `${column.maxWidth}px`;
  return { ...style, ...stickyStyle };
}

/**
 * `<DataTable>`: div 实现(role=table 语义),支持自定义渲染、
 * 排序、固定列与 flex 伸缩列。分页由外部 `usePagination` 驱动。
 */
export function DataTable<T>({
  data,
  columns,
  sort,
  defaultSort,
  onSortChange,
  getRowSpacing,
  slots,
  slotProps,
  renderSortIndicator = defaultIndicator,
  className,
  style,
}: DataTableProps<T>) {
  const { sortedRows, toggleSort, getSortDirection } = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });
  const offsets = getStickyOffsets(columns);
  const Root = slots?.root ?? 'div';
  const HeaderRow = slots?.headerRow ?? 'div';
  const Row = slots?.row ?? 'div';
  const Cell = slots?.cell ?? 'div';

  return (
    <Root role="table" className={cx('uikit-dt', className)} style={style} {...slotProps?.root}>
      <div role="rowgroup">
        <HeaderRow role="row" {...slotProps?.headerRow}>
          {columns.map((column) => {
            const direction = getSortDirection(column.key);
            const stickyStyle = getStickyStyle(column, offsets);
            const headerContent = column.renderHeaderCell
              ? column.renderHeaderCell({ column })
              : column.header;
            return (
              <Cell
                key={column.key}
                role="columnheader"
                aria-sort={
                  direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : undefined
                }
                style={columnStyle(column, stickyStyle)}
                {...slotProps?.cell}
              >
                {column.sortable === false ? (
                  headerContent
                ) : (
                  <button type="button" onClick={() => toggleSort(column.key)}>
                    {headerContent}
                    {renderSortIndicator(direction)}
                  </button>
                )}
              </Cell>
            );
          })}
        </HeaderRow>
      </div>
      <div role="rowgroup">
        {sortedRows.map((rowData, index) => {
          const spacing = getRowSpacing?.({ row: rowData, index });
          const rowStyle: CSSProperties | undefined = spacing
            ? { paddingTop: spacing.top, paddingBottom: spacing.bottom }
            : undefined;
          return (
            <Row key={index} role="row" style={rowStyle} {...slotProps?.row}>
              {columns.map((column) => {
                const value = getValue(rowData, column.accessor);
                const stickyStyle = getStickyStyle(column, offsets);
                const content = column.renderCell
                  ? column.renderCell({ row: rowData, value, column, index })
                  : String(value ?? '');
                return (
                  <Cell
                    key={column.key}
                    role="cell"
                    style={columnStyle(column, stickyStyle)}
                    {...slotProps?.cell}
                  >
                    {content}
                  </Cell>
                );
              })}
            </Row>
          );
        })}
      </div>
    </Root>
  );
}
