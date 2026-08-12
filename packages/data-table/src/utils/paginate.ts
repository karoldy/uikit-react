/** 分页切片结果 */
export interface PageSlice {
  /** 当前页首行下标(0-based) */
  start: number;
  /** 当前页末行下标(不含) */
  end: number;
  /** 总页数(1-based 计数) */
  pageCount: number;
}

/** 总页数;空数据或非法 pageSize 返回 0 */
export function getPageCount(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

/** 将页码(1-based)clamp 到合法范围;无页时返回 1 */
export function clampPage(page: number, pageCount: number): number {
  if (pageCount <= 0) return 1;
  return Math.min(Math.max(page, 1), pageCount);
}

/** 按页码(1-based)计算切片范围与总页数 */
export function getPageSlice(total: number, page: number, pageSize: number): PageSlice {
  const pageCount = getPageCount(total, pageSize);
  const clamped = clampPage(page, pageCount);
  return {
    start: (clamped - 1) * pageSize,
    end: Math.min(clamped * pageSize, total),
    pageCount,
  };
}
