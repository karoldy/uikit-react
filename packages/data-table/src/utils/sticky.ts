import type { CSSProperties } from 'react';
import type { ColumnBase } from '../types';

/**
 * 计算固定列(sticky)的偏移。约定: fixed 列必须提供 `width`,
 * 缺失时按 0 计(会导致偏移重叠)。
 */
export function getStickyOffsets<T>(
  columns: readonly ColumnBase<T>[],
): Map<string, { left?: number; right?: number }> {
  const offsets = new Map<string, { left?: number; right?: number }>();
  for (const column of columns) {
    offsets.set(column.key, {});
  }
  let left = 0;
  let right = 0;
  for (const column of columns) {
    if (column.fixed === 'left') {
      offsets.set(column.key, { left });
      left += column.width ?? 0;
    }
  }
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i];
    if (column.fixed === 'right') {
      offsets.set(column.key, { right });
      right += column.width ?? 0;
    }
  }
  return offsets;
}

/** 固定列的 sticky 样式;非 fixed 列返回 undefined */
export function getStickyStyle<T>(
  column: ColumnBase<T>,
  offsets: Map<string, { left?: number; right?: number }>,
): CSSProperties | undefined {
  if (column.fixed !== 'left' && column.fixed !== 'right') return undefined;
  const offset = offsets.get(column.key) ?? {};
  return {
    position: 'sticky',
    left: column.fixed === 'left' ? offset.left : undefined,
    right: column.fixed === 'right' ? offset.right : undefined,
    zIndex: 1,
  };
}
