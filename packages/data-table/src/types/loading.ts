export type TableLoading = 'row' | 'cell' | 'line' | 'spin';

/** 无数据时 `line` 回退为 `row`（表头线需要已有行才有意义） */
export function resolveLoading(
  loading: TableLoading | false | undefined,
  hasData: boolean,
): TableLoading | false {
  if (!loading) return false;
  if (loading === 'line' && !hasData) return 'row';
  return loading;
}

export const DEFAULT_SKELETON_ROWS = 12;
