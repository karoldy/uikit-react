import type { Accessor } from '../types';

/** 按 accessor 从行数据取值 */
export function getValue<T>(row: T, accessor: Accessor<T>): unknown {
  return typeof accessor === 'function' ? accessor(row) : row[accessor];
}
