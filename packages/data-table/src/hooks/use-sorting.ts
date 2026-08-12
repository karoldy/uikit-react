import { useCallback, useMemo, useState } from 'react';
import type { ColumnBase, SortState } from '../types';
import { sortRows } from '../utils/sort-rows';

export interface UseSortingOptions<T> {
  data: readonly T[];
  columns: readonly ColumnBase<T>[];
  /** 受控排序状态 */
  sort?: SortState;
  /** 非受控初始排序状态 */
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
}

export interface UseSortingReturn<T> {
  /** 当前排序状态(受控时为 props.sort) */
  sort: SortState;
  /** 按排序派生的行 */
  sortedRows: T[];
  /** 三态循环切换某列排序: none → asc → desc → none */
  toggleSort: (columnKey: string) => void;
  /** 某列当前排序方向,未排该列时为 undefined */
  getSortDirection: (columnKey: string) => SortState['direction'];
}

export function useSorting<T>({
  data,
  columns,
  sort: controlledSort,
  defaultSort,
  onSortChange,
}: UseSortingOptions<T>): UseSortingReturn<T> {
  const [internalSort, setInternalSort] = useState<SortState>(defaultSort ?? {});
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? controlledSort : internalSort;

  const setSort = useCallback(
    (next: SortState) => {
      if (!isControlled) setInternalSort(next);
      onSortChange?.(next);
    },
    [isControlled, onSortChange],
  );

  const toggleSort = useCallback(
    (columnKey: string) => setSort(nextSortState(sort, columnKey)),
    [setSort, sort],
  );

  const getSortDirection = useCallback(
    (columnKey: string): SortState['direction'] =>
      sort.columnKey === columnKey ? sort.direction : undefined,
    [sort],
  );

  const sortedRows = useMemo(() => sortRows(data, columns, sort), [data, columns, sort]);

  return { sort, sortedRows, toggleSort, getSortDirection };
}

/** 三态循环: none → asc → desc → none */
function nextSortState(current: SortState, columnKey: string): SortState {
  if (current.columnKey !== columnKey || !current.direction) {
    return { columnKey, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { columnKey, direction: 'desc' };
  }
  return {};
}
