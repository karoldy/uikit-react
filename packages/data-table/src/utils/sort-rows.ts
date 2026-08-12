import type { ColumnBase, SortState } from '../types';
import { getValue } from './get-value';

/**
 * 比较两个值: `null` / `undefined` 恒定沉底;数字按数值、
 * 字符串按 locale、其余类型字符串化后比较。
 */
export function compareValues(a: unknown, b: unknown): number {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return String(a).localeCompare(String(b));
}

/**
 * 按 SortState 排序行。稳定排序(同值保持原相对顺序)。
 * 未排序或列不可用时原样返回副本。
 */
export function sortRows<T>(
  rows: readonly T[],
  columns: readonly ColumnBase<T>[],
  sort: SortState,
): T[] {
  const column = columns.find((c) => c.key === sort.columnKey && c.sortable !== false);
  if (!column || !sort.direction) return [...rows];
  const direction = sort.direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const cmp = compareValues(getValue(a.row, column.accessor), getValue(b.row, column.accessor));
      return cmp !== 0 ? cmp * direction : a.index - b.index;
    })
    .map(({ row }) => row);
}
