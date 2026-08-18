import type { GridColumn, GridRow } from '../types/grid';
import { flex } from './flex';

export type LayoutFixed = 'start' | 'end' | 'center';

export interface ColumnEntry<TColumn> {
  key: string;
  column: TColumn;
}

export interface RowEntry<TRow> {
  key: string;
  row: TRow;
}

export type LayoutColumn = GridColumn & { width: number; fixed: LayoutFixed; left?: number };
export type LayoutRow = GridRow & { height: number; fixed: LayoutFixed; top?: number };

export interface ColumnsLayout<TColumn extends LayoutColumn = LayoutColumn> {
  all: TColumn[];
  start: ColumnEntry<TColumn>[];
  center: ColumnEntry<TColumn>[];
  end: ColumnEntry<TColumn>[];
  width: number;
}

export interface RowsLayout<TRow extends LayoutRow = LayoutRow> {
  all: TRow[];
  start: RowEntry<TRow>[];
  center: RowEntry<TRow>[];
  end: RowEntry<TRow>[];
  height: number;
}

function toColumnFixed(fixed?: 'start' | 'end'): LayoutFixed {
  if (fixed === 'start') return 'start';
  if (fixed === 'end') return 'end';
  return 'center';
}

function toRowFixed(fixed?: 'start' | 'end'): LayoutFixed {
  if (fixed === 'start') return 'start';
  if (fixed === 'end') return 'end';
  return 'center';
}

export function columnsOf<TColumn extends GridColumn>(
  columnWidth: ((column: TColumn, rows: readonly GridRow[]) => number) | undefined,
  gridWidth: number,
  rows: readonly GridRow[],
  columns: readonly TColumn[],
): ColumnsLayout<TColumn & { width: number; fixed: LayoutFixed }> {
  const result: ColumnsLayout<TColumn & { width: number; fixed: LayoutFixed }> = {
    all: [],
    start: [],
    center: [],
    end: [],
    width: 0,
  };

  if (!gridWidth) return result;

  result.all = flex(
    (item) => {
      result.width += item.value;

      const column = {
        ...item.column,
        width: item.value,
        fixed: toColumnFixed(item.column.fixed),
      } as TColumn & { width: number; fixed: LayoutFixed };

      const bucket = column.fixed;
      result[bucket].push({
        column,
        key: `__column_${bucket}_${result[bucket].length}__`,
      });

      return column;
    },
    gridWidth,
    columns.map((column) => {
      if (!column) return null;

      const base = (columnWidth && columnWidth(column, rows)) || column.width || 0;

      return {
        column,
        flexible: column.width === undefined,
        value: base,
        min: column.minWidth,
        max: column.maxWidth,
      };
    }),
  );

  return result;
}

export function rowsOf<TRow extends GridRow>(
  rowHeight: ((row: TRow, columns: readonly GridColumn[]) => number) | undefined,
  rows: readonly TRow[],
  columns: readonly GridColumn[],
  defaultHeight = 32,
): RowsLayout<TRow & { height: number; fixed: LayoutFixed }> {
  const result: RowsLayout<TRow & { height: number; fixed: LayoutFixed }> = {
    all: [],
    start: [],
    center: [],
    end: [],
    height: 0,
  };

  const resolveHeight = (row: TRow) => {
    if (rowHeight) return rowHeight(row, columns);
    return defaultHeight;
  };

  for (const item of rows) {
    if (!item || Object.keys(item).length === 0) continue;

    const height = resolveHeight(item);
    if (!height) continue;

    const row = {
      ...item,
      height,
      fixed: toRowFixed(item.fixed),
    } as TRow & { height: number; fixed: LayoutFixed };

    const bucket = row.fixed;
    result[bucket].push({
      row,
      key: `__row_${bucket}_${result[bucket].length}__`,
    });

    result.height += height;
    result.all.push(row);
  }

  return result;
}
