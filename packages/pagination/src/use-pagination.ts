import { useCallback, useMemo, useState } from 'react';
import { clampPage, getPageCount, getPageSlice } from './paginate';

export interface UsePaginationOptions {
  /** 总行数(按切分后的数据源长度传入,如排序后行数) */
  total: number;
  /** 每页行数,默认 10;不支持动态修改 */
  pageSize?: number;
  /** 受控页码(1-based) */
  page?: number;
  /** 非受控初始页码(1-based),默认 1 */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  /** 当前页码(1-based) */
  page: number;
  /** 每页行数 */
  pageSize: number;
  /** 总页数 */
  pageCount: number;
  /** 当前页切片范围: 行下标 [start, end) */
  start: number;
  end: number;
  canPrev: boolean;
  canNext: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * 独立于表格的分页状态。表格组件不内嵌分页,
 * 使用方: `data.slice(start, end)` 得到当前页数据。
 */
export function usePagination({
  total,
  pageSize = 10,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
}: UsePaginationOptions): UsePaginationReturn {
  const [internalPage, setInternalPage] = useState(defaultPage);
  const isControlled = controlledPage !== undefined;
  const pageCount = getPageCount(total, pageSize);

  const setPage = useCallback(
    (next: number) => {
      const clamped = clampPage(next, pageCount);
      if (!isControlled) setInternalPage(clamped);
      onPageChange?.(clamped);
    },
    [isControlled, pageCount, onPageChange],
  );

  const nextPage = useCallback(
    () => setPage((isControlled ? controlledPage : internalPage) + 1),
    [isControlled, controlledPage, internalPage, setPage],
  );

  const prevPage = useCallback(
    () => setPage((isControlled ? controlledPage : internalPage) - 1),
    [isControlled, controlledPage, internalPage, setPage],
  );

  const rawPage = isControlled ? (controlledPage ?? 1) : internalPage;
  const page = clampPage(rawPage, pageCount);
  const { start, end } = getPageSlice(total, page, pageSize);

  return useMemo(
    () => ({
      page,
      pageSize,
      pageCount,
      start,
      end,
      canPrev: page > 1,
      canNext: page < pageCount,
      setPage,
      nextPage,
      prevPage,
    }),
    [page, pageSize, pageCount, start, end, setPage, nextPage, prevPage],
  );
}
