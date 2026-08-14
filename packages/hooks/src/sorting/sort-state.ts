import type { SortItem, SortState, SortStateInput } from './types';

function isSortItem(value: unknown): value is SortItem {
  if (value === null || typeof value !== 'object') return false;
  const item = value as SortItem;
  return Boolean(item.columnKey) && (item.direction === 'asc' || item.direction === 'desc');
}

/** 把 `sort` / `defaultSort` 入参规范成数组。`{}` 与无效项视为无排序。 */
export function normalizeSort(input?: SortStateInput): SortState {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) {
    if (input.every(isSortItem)) return input;
    return input.filter(isSortItem);
  }
  if (isSortItem(input)) return [{ columnKey: input.columnKey, direction: input.direction }];
  return [];
}
