import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getVirtualRange } from '../utils/virtual-range';

export interface UseVirtualRowsOptions {
  /** 总行数 */
  count: number;
  /** 固定行高(px) */
  rowHeight: number;
  /**
   * 行间距(px,常量)。虚拟化假设各行扩展后高度一致,
   * 由调用方(如 VirtualTable)从 `getRowSpacing` 对某行求值得到。
   */
  spacing?: { top: number; bottom: number };
  /** 上下 overscan 行数,默认 5 */
  overscan?: number;
}

export interface VirtualRow {
  /** 数据行下标 */
  index: number;
  /** 该行的 y 偏移(px,不含上间距),用于绝对定位 */
  offsetTop: number;
  /** 该行上间距(px) */
  spacingTop: number;
  /** 该行下间距(px) */
  spacingBottom: number;
}

export interface UseVirtualRowsReturn {
  /** 滚动容器 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 内容总高度(px),含所有行与间距 */
  totalHeight: number;
  /** 首可见行下标(含 overscan) */
  start: number;
  /** 末可见行下标(不含) */
  end: number;
  /** 可见行(含 overscan) */
  virtualItems: VirtualRow[];
}

/**
 * 自研虚拟化: 固定行高 + overscan + 滚动容器监听。
 * 仅渲染可见区间,内容总高度撑起滚动条。
 */
export function useVirtualRows({
  count,
  rowHeight,
  spacing,
  overscan = 5,
}: UseVirtualRowsOptions): UseVirtualRowsReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ height: 0, scrollTop: 0 });

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewport({ height: el.clientHeight, scrollTop: el.scrollTop });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // 初始测量(含内容高度不足一屏的情况)
    setViewport({ height: el.clientHeight, scrollTop: el.scrollTop });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const top = spacing?.top ?? 0;
  const bottom = spacing?.bottom ?? 0;
  const effective = rowHeight + top + bottom;

  const range = useMemo(
    () =>
      getVirtualRange({
        viewportHeight: viewport.height,
        scrollTop: viewport.scrollTop,
        rowHeight: effective,
        count,
        overscan,
      }),
    [viewport.height, viewport.scrollTop, effective, count, overscan],
  );

  const virtualItems = useMemo<VirtualRow[]>(() => {
    const items: VirtualRow[] = [];
    for (let index = range.start; index < range.end; index++) {
      items.push({
        index,
        offsetTop: index * effective + top,
        spacingTop: top,
        spacingBottom: bottom,
      });
    }
    return items;
  }, [range.start, range.end, effective, top, bottom]);

  return {
    containerRef,
    totalHeight: range.totalHeight,
    start: range.start,
    end: range.end,
    virtualItems,
  };
}
