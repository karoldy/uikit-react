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
  } else {
    style.flex = '0 0 auto';
    if (column.width !== undefined) style.width = `${column.width}px`;
  }
  if (column.minWidth !== undefined) style.minWidth = `${column.minWidth}px`;
  if (column.maxWidth !== undefined) style.maxWidth = `${column.maxWidth}px`;
  return { ...style, ...stickyStyle };
}
