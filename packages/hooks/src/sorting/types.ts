/**
 * 行数据访问器: 键名或取值函数。
 */
export type Accessor<T> = keyof T | ((row: T) => unknown);

/**
 * `ColumnBase` 的最小子集；data-table 列结构可赋值给它。
 */
export interface SortableColumn<T> {
  key: string;
  accessor: Accessor<T>;
  sortable?: boolean;
}

/** 排序方向 */
export type SortDirection = 'asc' | 'desc';

/** 一列的排序项。数组中的顺序即优先级。 */
export interface SortItem {
  columnKey: string;
  direction: SortDirection;
}

/**
 * 当前排序状态。空数组表示无排序；多项表示多列排序，靠前的优先级更高。
 */
export type SortState = readonly SortItem[];

/**
 * 旧版单列对象。`sort` / `defaultSort` 仍接受；`{}` 视为无排序。
 */
export interface SortStateSingle {
  columnKey?: string;
  direction?: SortDirection;
}

/** `sort` / `defaultSort` 的入参：数组或旧版单列对象 */
export type SortStateInput = SortState | SortStateSingle;

/** 受控排序时 `onSortChange` 始终回调规范化后的数组 */
export type SortChange = SortState;
