import type { CSSProperties } from 'react';
import type { DataTableColumn } from '../types';

export function columnStyle<T>(
  column:
    DataTableColumn<T> | { width?: number; flex?: number; minWidth?: number; maxWidth?: number },
  stickyStyle: CSSProperties | undefined,
): CSSProperties {
  const style: CSSProperties = {};
  if (column.flex !== undefined) {
    style.flexGrow = column.flex;
    style.flexShrink = 1;
    style.flexBasis = column.width !== undefined ? `${column.width}px` : '0px';
  } else if (column.width !== undefined) {
    style.flex = '0 0 auto';
    style.width = `${column.width}px`;
  } else {
    // 未指定 width / flex 时均分剩余空间，表头与单元格才能对齐并撑满行宽。
    // flex-basis 必须是 0：若为 auto，表头短文案与单元格长内容会算出不同列宽。
    style.flexGrow = 1;
    style.flexShrink = 1;
    style.flexBasis = '0px';
    style.minWidth = 0;
  }
  if (column.minWidth !== undefined) style.minWidth = `${column.minWidth}px`;
  if (column.maxWidth !== undefined) style.maxWidth = `${column.maxWidth}px`;
  return { ...style, ...stickyStyle };
}
