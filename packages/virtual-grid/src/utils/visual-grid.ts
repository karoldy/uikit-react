import type { ColumnsLayout, RowsLayout } from './layout';
import { sight } from './sight';

export interface VisualGridInput {
  top: number;
  left: number;
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  columns: ColumnsLayout;
  data: RowsLayout;
  exceed?: number;
}

export function getVisualGrid(input: VisualGridInput) {
  const {
    top,
    left,
    width,
    height,
    scrollWidth,
    scrollHeight,
    columns,
    data,
    exceed = 100,
  } = input;

  const visualColumns = sight(
    ({ column }, position, isRelativeToStartPosition) => {
      column.left = isRelativeToStartPosition ? position : width - position - column.width;
      return column.width;
    },
    {
      client: width,
      scroll: scrollWidth,
      position: left,
      exceed,
    },
    columns,
  );

  const visualData = sight(
    ({ row }, position, isRelativeToStartPosition) => {
      row.top = isRelativeToStartPosition ? position : height - position - row.height;
      return row.height;
    },
    {
      client: height,
      scroll: scrollHeight,
      position: top,
      exceed,
    },
    data,
  );

  return [
    { columns: visualColumns.center, data: visualData.center },
    { columns: visualColumns.center, data: [...visualData.end, ...visualData.start] },
    { columns: [...visualColumns.end, ...visualColumns.start], data: visualData.center },
    {
      columns: [...visualColumns.end, ...visualColumns.start],
      data: [...visualData.end, ...visualData.start],
    },
  ];
}
