/** 虚拟化可见范围计算(纯函数) */
export interface VirtualRangeOptions {
  /** 容器可视高度(px) */
  viewportHeight: number;
  /** 滚动偏移(px) */
  scrollTop: number;
  /** 固定行高(px) */
  rowHeight: number;
  /** 总行数 */
  count: number;
  /** 上下 overscan 行数,默认 5 */
  overscan?: number;
}

export interface VirtualRange {
  /** 首可见行下标(含 overscan) */
  start: number;
  /** 末可见行下标(不含) */
  end: number;
  /** 内容总高度(px) */
  totalHeight: number;
  /** 首可见行的 y 偏移(px),用于绝对定位 */
  offsetStart: number;
}

export function getVirtualRange({
  viewportHeight,
  scrollTop,
  rowHeight,
  count,
  overscan = 5,
}: VirtualRangeOptions): VirtualRange {
  if (count <= 0 || rowHeight <= 0) {
    return { start: 0, end: 0, totalHeight: 0, offsetStart: 0 };
  }
  const totalHeight = count * rowHeight;
  const firstVisible = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + 1;
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(count, firstVisible + visibleCount + overscan);
  return { start, end, totalHeight, offsetStart: start * rowHeight };
}
