import type { HTMLAttributes, Key, ReactNode } from 'react';
import type { SortDirection, SortState, TableColumn } from '../types';
import { useSorting } from '../hooks/use-sorting';
import { cx } from '../utils/cx';
import { getStickyOffsets, getStickyStyle } from '../utils/sticky';
import { getValue } from '../utils/get-value';

/** 排序方向指示器默认渲染: 升序 ↑ / 降序 ↓ / 未排序 ⇅ */
const defaultIndicator = (direction: SortDirection | undefined): ReactNode =>
  direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '⇅';

export interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  data: readonly T[];
  columns: readonly TableColumn<T>[];
  /** 受控排序状态 */
  sort?: SortState;
  /** 非受控初始排序状态 */
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** 行间距(px),作用于每行各 `<td>` 的 padding-top/bottom(逐行独立) */
  getRowSpacing?: (context: { row: T; index: number }) => { top: number; bottom: number };
  /** 行 key 提取,缺省用行索引 */
  getRowKey?: (row: T, index: number) => Key;
  /** 排序方向指示器,缺省 ↑/↓/⇅ */
  renderSortIndicator?: (direction: SortDirection | undefined) => ReactNode;
}

/**
 * 最简单的表格: `<table>` 标签实现,纯文本渲染,支持排序与固定列。
 */
export function Table<T>({
  data,
  columns,
  sort,
  defaultSort,
  onSortChange,
  getRowSpacing,
  getRowKey,
  renderSortIndicator = defaultIndicator,
  className,
  ...rest
}: TableProps<T>) {
  const { sortedRows, toggleSort, getSortDirection } = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
  });
  const offsets = getStickyOffsets(columns);

  return (
    <table className={cx('uikit-dt', className)} {...rest}>
      <thead>
        <tr>
          {columns.map((column) => {
            const direction = getSortDirection(column.key);
            const stickyStyle = getStickyStyle(column, offsets);
            return (
              <th
                key={column.key}
                aria-sort={
                  direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : undefined
                }
                style={stickyStyle}
              >
                {column.sortable === false ? (
                  column.header
                ) : (
                  <button type="button" onClick={() => toggleSort(column.key)}>
                    {column.header}
                    {renderSortIndicator(direction)}
                  </button>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, index) => {
          const spacing = getRowSpacing?.({ row, index });
          const spacingStyle = spacing
            ? { paddingTop: spacing.top, paddingBottom: spacing.bottom }
            : undefined;
          return (
            <tr key={getRowKey ? getRowKey(row, index) : index}>
              {columns.map((column) => {
                const stickyStyle = getStickyStyle(column, offsets);
                return (
                  <td
                    key={column.key}
                    style={stickyStyle ? { ...spacingStyle, ...stickyStyle } : spacingStyle}
                  >
                    {String(getValue(row, column.accessor) ?? '')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
