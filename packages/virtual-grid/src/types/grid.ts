import type { CSSProperties, ReactElement, ReactNode } from 'react';

export type Fixed = 'start' | 'end';

export interface Size {
  width: number;
  height: number;
}

export interface GridColumn {
  key: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  fixed?: Fixed;
}

export interface GridRow {
  fixed?: Fixed;
}

export interface GridRenderContext<C extends GridColumn = GridColumn, R extends GridRow = GridRow> {
  column: C;
  row: R;
  /**
   * v2: merge helper.
   *
   * 调用方式：
   * ```tsx
   * if (merge?.((info) => <Cell>{info.key}</Cell>)) return null;
   * return <Cell>normal</Cell>;
   * ```
   *
   * 返回值含义：`true` 表示当前 cell 属于 merge 块且 Grid 已处理（调用方应返回 `null`）；
   * `false` 表示不属于 merge 块，调用方应正常渲染 cell。
   */
  merge?: <TRender extends (info: MergeCellInfo) => ReactElement | null>(
    render: TRender,
  ) => boolean;
}

export interface MergeCellInfo {
  key: string;
  width: number;
  height: number;
  top: number;
  left: number;
  fixed: { column: Fixed | 'center'; row: Fixed | 'center' };
}

export interface GridProps<C extends GridColumn = GridColumn, R extends GridRow = GridRow> {
  columns: readonly C[];
  data: readonly R[];
  columnWidth?: (column: C, rows: readonly R[]) => number;
  rowHeight?: (row: R, columns: readonly C[]) => number;
  exceed?: number;
  /** v2: 合并单元格（同一个 key 会合并成一个大单元格） */
  merge?: (column: C, row: R) => ({ key: string } & Record<string, unknown>) | null | undefined;
  onScroll?: () => void;
  onResize?: (current: Size, last: Size) => void;
  /**
   * v3: report content "needed size" (scrollWidth/scrollHeight).
   * Useful for `GridPanel` height distribution.
   */
  onLimit?: (limit: Size) => void;
  className?: string;
  style?: CSSProperties;
  children: (ctx: GridRenderContext<C, R>) => ReactElement | null;
}

export interface CellAlign {
  horizontal?: 'start' | 'end' | 'center';
  vertical?: 'start' | 'end' | 'center';
}

export interface CellBorder {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface CellProps {
  className?: string;
  style?: CSSProperties;
  odd?: boolean;
  even?: boolean;
  align?: CellAlign;
  border?: CellBorder;
  children?: ReactNode;
}

export interface GridHandle {
  scrollTo: (left: number, top: number) => void;
}
