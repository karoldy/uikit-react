import type { ElementType } from 'react';

/**
 * 可替换内部 DOM 元素的 slot 类型。
 * 用法与 `@uikit-react/popover` 的 `SlotPropsOf` 一致(这里取非泛型简化版)。
 */
export type SlotPropsOf = Record<string, unknown>;

/**
 * DataTable / VirtualTable 的可定制插槽。
 * 缺省均为对应语义的 HTML 元素(root=div, headerRow=div, row=div, cell=div)。
 */
export interface DataTableSlots {
  root?: ElementType;
  headerRow?: ElementType;
  row?: ElementType;
  cell?: ElementType;
}

/** 每个 slot 对应的 props(className / style 等,原样透传) */
export interface DataTableSlotProps {
  root?: SlotPropsOf;
  headerRow?: SlotPropsOf;
  row?: SlotPropsOf;
  cell?: SlotPropsOf;
}

/** 行间距上下文 */
export interface RowSpacingContext<T> {
  row: T;
  index: number;
}

/** 行间距(px),三种表格通用 */
export type GetRowSpacing<T> = (context: RowSpacingContext<T>) => {
  top: number;
  bottom: number;
};
