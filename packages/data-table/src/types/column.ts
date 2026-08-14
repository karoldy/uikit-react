import type { ReactNode } from 'react';
import type { Accessor } from '@uikit-react/hooks';

export type { Accessor };

/**
 * 列模型单一来源。Table / DataTable 共享:
 * - `Table`     → `TableColumn`(纯文本渲染)
 * - `DataTable` → `DataTableColumn`(支持 renderCell / flex)
 */
export interface ColumnBase<T> {
  /** 稳定列 id,也是排序状态的标识 */
  key: string;
  /** 从行数据中取值 */
  accessor: Accessor<T>;
  /** 表头内容 */
  header: ReactNode;
  /** 是否可排序,默认 true */
  sortable?: boolean;
  /** 列宽(px) */
  width?: number;
  /** 最小列宽(px) */
  minWidth?: number;
  /** 最大列宽(px) */
  maxWidth?: number;
  /** 固定列(sticky)。约定: fixed 列必须提供 `width`,否则偏移无法计算 */
  fixed?: 'left' | 'right';
}

/**
 * `<Table>` 的列定义。忠实"纯渲染文本": header 收窄为 string,
 * 单元格值一律字符串化。
 */
export interface TableColumn<T> extends ColumnBase<T> {
  header: string;
}

/** DataTable 单元格渲染上下文 */
export interface CellContext<T> {
  row: T;
  /** accessor 取出的原始值(可能为 undefined) */
  value: unknown;
  column: DataTableColumn<T>;
  /** 行在数据源中的下标 */
  index: number;
}

/** DataTable 表头渲染上下文 */
export interface HeaderContext<T> {
  column: DataTableColumn<T>;
}

/**
 * `<DataTable>` 的列定义(div 实现,可自定义渲染)。
 */
export interface DataTableColumn<T> extends ColumnBase<T> {
  /** 自定义单元格渲染,缺省回退为纯文本 */
  renderCell?: (context: CellContext<T>) => ReactNode;
  /** 自定义表头渲染,缺省渲染 `header` */
  renderHeaderCell?: (context: HeaderContext<T>) => ReactNode;
  /**
   * flex 伸缩比例(对应 `flex-grow`)。提供时 `width` 作为基础宽度,
   * 该列随容器伸缩;不提供时按 `width` 定宽。
   * 固定列(`fixed`)不可同时使用 `flex`。
   */
  flex?: number;
}
