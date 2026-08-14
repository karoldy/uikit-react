import { useCallback, useMemo, useState } from 'react';
import type { SortableColumn, SortDirection, SortState, SortStateInput } from './types';
import { sortRows } from './sort-rows';
import { normalizeSort } from './sort-state';

export interface ToggleSortOptions {
  /** 为 true 时追加/循环该列，不替换其它列。默认由 `multiSort` 决定。 */
  multi?: boolean;
}

export interface UseSortingOptions<T> {
  data: readonly T[];
  columns: readonly SortableColumn<T>[];
  /** 受控排序状态（数组或旧版单列对象） */
  sort?: SortStateInput;
  /** 非受控初始排序状态 */
  defaultSort?: SortStateInput;
  onSortChange?: (sort: SortState) => void;
  /** 为 true 时单击也走多列排序；Shift+click 始终追加 */
  multiSort?: boolean;
}

export interface UseSortingReturn<T> {
  /** 当前排序状态(受控时为规范化后的 props.sort) */
  sort: SortState;
  /** 按排序派生的行 */
  sortedRows: T[];
  /** 三态循环切换某列排序: none → asc → desc → none */
  toggleSort: (columnKey: string, options?: ToggleSortOptions) => void;
  /** 某列当前排序方向,未排该列时为 undefined */
  getSortDirection: (columnKey: string) => SortDirection | undefined;
}

export function useSorting<T>({
  data,
  columns,
  sort: controlledSort,
  defaultSort,
  onSortChange,
  multiSort = false,
}: UseSortingOptions<T>): UseSortingReturn<T> {
  const [internalSort, setInternalSort] = useState<SortState>(() => normalizeSort(defaultSort));
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? normalizeSort(controlledSort) : internalSort;

  const setSort = useCallback(
    (next: SortState) => {
      if (!isControlled) setInternalSort(next);
      onSortChange?.(next);
    },
    [isControlled, onSortChange],
  );

  const toggleSort = useCallback(
    (columnKey: string, options?: ToggleSortOptions) => {
      const multi = options?.multi ?? multiSort;
      setSort(nextSortState(sort, columnKey, multi));
    },
    [setSort, sort, multiSort],
  );

  const getSortDirection = useCallback(
    (columnKey: string): SortDirection | undefined =>
      sort.find((item) => item.columnKey === columnKey)?.direction,
    [sort],
  );

  const sortedRows = useMemo(() => sortRows(data, columns, sort), [data, columns, sort]);

  return { sort, sortedRows, toggleSort, getSortDirection };
}

/** 单列: none → asc → desc → none；多列: 追加 / 就地循环 / 移除 */
function nextSortState(current: SortState, columnKey: string, multi: boolean): SortState {
  const index = current.findIndex((item) => item.columnKey === columnKey);

  if (multi) {
    if (index === -1) return [...current, { columnKey, direction: 'asc' }];
    if (current[index].direction === 'asc') {
      return current.map((item, i) => (i === index ? { columnKey, direction: 'desc' } : item));
    }
    return current.filter((_, i) => i !== index);
  }

  const only = current.length === 1 && current[0].columnKey === columnKey;
  if (!only) return [{ columnKey, direction: 'asc' }];
  if (current[0].direction === 'asc') return [{ columnKey, direction: 'desc' }];
  return [];
}
