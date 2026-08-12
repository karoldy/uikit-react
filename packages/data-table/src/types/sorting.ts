/** 排序方向 */
export type SortDirection = 'asc' | 'desc';

/**
 * 当前排序状态。空对象表示无排序。
 * - `columnKey` 为空: 未排序
 * - `columnKey` 存在 + `direction: 'asc'` / `'desc'`: 升序 / 降序
 */
export interface SortState {
  columnKey?: string;
  direction?: SortDirection;
}

/** 受控排序时 `onSortChange` 的回调参数 */
export interface SortChange {
  columnKey?: string;
  direction?: SortDirection;
}
