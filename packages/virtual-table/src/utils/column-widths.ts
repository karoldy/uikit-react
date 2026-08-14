export interface WidthInput {
  width?: number;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}

function clamp(value: number, minWidth?: number, maxWidth?: number): number {
  let next = value;
  if (minWidth !== undefined) next = Math.max(next, minWidth);
  if (maxWidth !== undefined) next = Math.min(next, maxWidth);
  return next;
}

export function resolveColumnWidths(
  columns: readonly WidthInput[],
  viewportWidth: number,
): number[] {
  let flexTotal = 0;
  let fixedSum = 0;

  for (const column of columns) {
    if (column.flex !== undefined) {
      flexTotal += column.flex;
    } else {
      fixedSum += clamp(column.width ?? 0, column.minWidth, column.maxWidth);
    }
  }

  const free = Math.max(0, viewportWidth - fixedSum);

  return columns.map((column) => {
    if (column.flex !== undefined) {
      const raw = flexTotal === 0 ? 0 : free * (column.flex / flexTotal);
      return clamp(raw, column.minWidth, column.maxWidth);
    }
    return clamp(column.width ?? 0, column.minWidth, column.maxWidth);
  });
}

export function prefixSums(widths: readonly number[]): number[] {
  const sums = [0];
  for (const width of widths) {
    sums.push(sums[sums.length - 1]! + width);
  }
  return sums;
}
