export interface ViewportRange {
  /** 含 overscan，inclusive */
  start: number;
  /** 含 overscan，inclusive */
  end: number;
}

export function findIndexByOffset(offset: number, itemSize: number, count: number): number {
  if (count <= 0 || itemSize <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(offset / itemSize)));
}

export function getViewportRange(options: {
  offset: number; // scrollTop 或 scrollLeft
  viewportSize: number; // clientHeight 或 clientWidth
  itemSize: number;
  count: number;
  overscan?: number; // 默认 4，与 RDG 一致
}): ViewportRange {
  const { offset, viewportSize, itemSize, count, overscan = 4 } = options;
  if (count === 0) return { start: 0, end: 0 };

  const start = Math.max(0, findIndexByOffset(offset, itemSize, count) - overscan);
  const end = Math.min(
    count - 1,
    findIndexByOffset(offset + viewportSize, itemSize, count) + overscan,
  );
  return { start, end };
}

/** prefix[i] = 第 i 列左缘；prefix[count] = 总宽 */
export function findIndexByPrefix(offset: number, prefix: readonly number[]): number {
  if (prefix.length === 0 || offset <= 0) return 0;

  let lo = 0;
  let hi = prefix.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (prefix[mid] <= offset) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return hi;
}
