import type { CSSProperties, ReactNode } from 'react';
import type {
  DataTableSlotProps,
  DataTableSlots,
  GetRowSpacing,
  SortState,
  VirtualTableColumn,
} from '../types';
import { useSorting } from '../hooks/use-sorting';
import { useVirtualRows } from '../hooks/use-virtual-rows';
import { cx } from '../utils/cx';
import { getStickyOffsets, getStickyStyle } from '../utils/sticky';
import { getValue } from '../utils/get-value';

export interface VirtualTableProps<T> {
  data: readonly T[];
  columns: readonly VirtualTableColumn<T>[];
  /** 固定行高(px) */
  rowHeight: number;
  /** 上下 overscan 行数,默认 5 */
  overscan?: number;
  /** 容器可视高度(px);缺省 300 */
  height?: number;
  /** 受控排序状态 */
  sort?: SortState;
  /** 非受控初始排序状态 */
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /**
   * 行间距(px)。虚拟化假设各行扩展后高度一致,应返回常量
   * (如 `getRowSpacing={() => ({ top: 8, bottom: 8 })}`),
   * 否则可视范围估算会漂移。
   */
  getRowSpacing?: GetRowSpacing<T>;
  /** 可替换内部元素 */
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  /** 排序方向指示器,缺省 ↑/↓/⇅ */
  renderSortIndicator?: (direction: SortState['direction']) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

const defaultIndicator = (direction: SortState['direction']): ReactNode =>
  direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '⇅';

/** 虚拟表格列必须是定宽或 flex,flexBasis 由列宽/flex 推导 */
function virtualColumnStyle<T>(
  column: VirtualTableColumn<T>,
  stickyStyle: CSSProperties | undefined,
): CSSProperties {
  const style: CSSProperties = {};
  const width = 'width' in column && column.width !== undefined ? column.width : undefined;
  if (column.flex !== undefined) {
    style.flexGrow = column.flex;
    style.flexShrink = 1;
    style.flexBasis = width !== undefined ? `${width}px` : '0px';
  } else {
    style.flex = '0 0 auto';
    style.width = `${width}px`;
  }
  if (column.minWidth !== undefined) style.minWidth = `${column.minWidth}px`;
  if (column.maxWidth !== undefined) style.maxWidth = `${column.maxWidth}px`;
  return { ...style, ...stickyStyle };
}

/**
 * `<VirtualTable>`: div 实现,固定行高虚拟化渲染,支持自定义渲染、
 * 排序、固定列与 flex 列。仅渲染可见区间 + overscan。
 */
export function VirtualTable<T>({
  data,
  columns,
  rowHeight,
  overscan,
  height = 300,
  sort,
  defaultSort,
  onSortChange,
  getRowSpacing,
  slots,
  slotProps,
  renderSortIndicator = defaultIndicator,
  className,
  style,
}: VirtualTableProps<T>) {
  const { sortedRows, toggleSort, getSortDirection } = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });
  // 虚拟化要求常量间距: 以首行求值一次
  const spacing =
    sortedRows.length > 0 ? getRowSpacing?.({ row: sortedRows[0], index: 0 }) : undefined;
  const { containerRef, totalHeight, start, end, virtualItems } = useVirtualRows({
    count: sortedRows.length,
    rowHeight,
    spacing,
    overscan,
  });
  const offsets = getStickyOffsets(columns);
  const Root = slots?.root ?? 'div';
  const HeaderRow = slots?.headerRow ?? 'div';
  const Row = slots?.row ?? 'div';
  const Cell = slots?.cell ?? 'div';

  return (
    <Root
      role="table"
      className={cx('uikit-dt', className)}
      style={{ height, overflowY: 'auto', ...style }}
      {...slotProps?.root}
    >
      <div role="rowgroup" style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex' }}>
        <HeaderRow role="row" style={{ display: 'flex', flex: 1 }} {...slotProps?.headerRow}>
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
                style={virtualColumnStyle(column, stickyStyle)}
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
      <div ref={containerRef} role="rowgroup" style={{ height: totalHeight, position: 'relative' }}>
        {sortedRows.slice(start, end).map((rowData, i) => {
          const index = start + i;
          const item = virtualItems[i];
          return (
            <Row
              key={index}
              role="row"
              style={{
                position: 'absolute',
                top: item?.offsetTop,
                left: 0,
                right: 0,
                display: 'flex',
                paddingTop: item?.spacingTop,
                paddingBottom: item?.spacingBottom,
              }}
              {...slotProps?.row}
            >
              {columns.map((column) => {
                const cellValue = getValue(rowData, column.accessor);
                const stickyStyle = getStickyStyle(column, offsets);
                const content = column.renderCell
                  ? column.renderCell({ row: rowData, value: cellValue, column, index })
                  : String(cellValue ?? '');
                return (
                  <Cell
                    key={column.key}
                    role="cell"
                    style={virtualColumnStyle(column, stickyStyle)}
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
