import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { getValue, useSorting } from '@uikit-react/hooks';
import { cx } from './cx';
import { useGridDimensions } from './hooks/use-grid-dimensions';
import { useScrollState } from './hooks/use-scroll-state';
import type { VirtualTableColumn, VirtualTableProps } from './types';
import { prefixSums, resolveColumnWidths } from './utils/column-widths';
import { findIndexByPrefix, getViewportRange } from './utils/viewport';

const ZERO_SPACING = { top: 0, bottom: 0 };

export function VirtualTable<T>({
  data,
  columns,
  rowHeight,
  height = 350,
  overscan = 4,
  headerHeight = rowHeight,
  getRowSpacing,
  sort,
  defaultSort,
  onSortChange,
  multiSort,
  getRowKey = (_row, index) => index,
  className,
  style,
}: VirtualTableProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { width: gridWidth, height: gridHeight } = useGridDimensions(rootRef);
  const { scrollTop, scrollLeft } = useScrollState(rootRef);

  const { sortedRows, toggleSort, getSortDirection } = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
    multiSort,
  });

  const widths = useMemo(() => resolveColumnWidths(columns, gridWidth), [columns, gridWidth]);
  const prefix = useMemo(() => prefixSums(widths), [widths]);

  const spacing =
    sortedRows.length > 0
      ? (getRowSpacing?.({ row: sortedRows[0]!, index: 0 }) ?? ZERO_SPACING)
      : ZERO_SPACING;
  const effectiveRowHeight = rowHeight + spacing.top + spacing.bottom;

  const { start: rowStart, end: rowEnd } = getViewportRange({
    offset: scrollTop,
    viewportSize: Math.max(0, gridHeight - headerHeight),
    itemSize: effectiveRowHeight,
    count: sortedRows.length,
    overscan,
  });

  const visibleColumns = iterateVisibleColumns(columns, prefix, scrollLeft, gridWidth, overscan);
  const stickyByIndex = getStickyStyles(columns, widths);

  const rows = [];
  if (sortedRows.length > 0) {
    for (let rowIdx = rowStart; rowIdx <= rowEnd; rowIdx++) {
      const row = sortedRows[rowIdx];
      if (row === undefined) continue;
      rows.push(
        <div
          key={getRowKey(row, rowIdx)}
          className="uikit-vt__row"
          style={{
            gridRow: rowIdx + 2,
            paddingTop: spacing.top,
            paddingBottom: spacing.bottom,
          }}
        >
          {visibleColumns.map((colIdx) => {
            const column = columns[colIdx]!;
            const value = getValue(row, column.accessor);
            return (
              <div
                key={column.key}
                className="uikit-vt__cell"
                style={{ gridColumn: colIdx + 1, ...stickyByIndex[colIdx] }}
              >
                {column.renderCell?.({ row, value, column, index: rowIdx }) ?? (value as ReactNode)}
              </div>
            );
          })}
        </div>,
      );
    }
  }

  return (
    <div
      ref={rootRef}
      className={cx('uikit-vt', className)}
      style={{
        height,
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: widths.map((width) => `${width}px`).join(' '),
        gridTemplateRows: `${headerHeight}px repeat(${sortedRows.length}, ${effectiveRowHeight}px)`,
        ...style,
      }}
    >
      <div
        className="uikit-vt__header-row"
        style={{ position: 'sticky', top: 0, zIndex: 3, gridRow: 1 }}
      >
        {visibleColumns.map((colIdx) => {
          const column = columns[colIdx]!;
          const direction = getSortDirection(column.key);
          const label = column.renderHeaderCell?.({ column }) ?? column.header;
          const sortable = column.sortable !== false;
          return (
            <div
              key={column.key}
              className={cx(
                'uikit-vt__header-cell',
                'uikit-vt__cell',
                direction === 'asc' && 'uikit-vt__cell--sorted-asc',
                direction === 'desc' && 'uikit-vt__cell--sorted-desc',
              )}
              style={{ gridColumn: colIdx + 1, ...stickyByIndex[colIdx] }}
            >
              {sortable ? (
                <button
                  type="button"
                  onClick={(event) =>
                    toggleSort(column.key, event.shiftKey ? { multi: true } : undefined)
                  }
                >
                  {label}
                </button>
              ) : (
                label
              )}
            </div>
          );
        })}
      </div>
      {rows}
    </div>
  );
}

/** Visible column indices: viewport range ∪ frozen left/right, in column order. */
export function iterateVisibleColumns(
  columns: readonly { fixed?: 'left' | 'right' }[],
  prefix: readonly number[],
  scrollLeft: number,
  gridWidth: number,
  overscan = 4,
): number[] {
  const count = columns.length;
  if (count === 0) return [];

  const last = count - 1;
  const clampIndex = (index: number) => Math.max(0, Math.min(last, index));

  let start = clampIndex(findIndexByPrefix(scrollLeft, prefix));
  let end = clampIndex(findIndexByPrefix(scrollLeft + gridWidth, prefix));
  if (end < start) {
    const swap = start;
    start = end;
    end = swap;
  }

  start = Math.max(0, start - overscan);
  end = Math.min(last, end + overscan);

  const seen = new Set<number>();
  const indices: number[] = [];
  const add = (index: number) => {
    if (seen.has(index)) return;
    seen.add(index);
    indices.push(index);
  };

  for (let i = start; i <= end; i++) add(i);
  for (let i = 0; i < count; i++) {
    const fixed = columns[i]?.fixed;
    if (fixed === 'left' || fixed === 'right') add(i);
  }

  indices.sort((a, b) => a - b);
  return indices;
}

function getStickyStyles<T>(
  columns: readonly VirtualTableColumn<T>[],
  widths: readonly number[],
): Array<CSSProperties | undefined> {
  let left = 0;
  let right = 0;
  const leftOffsets: number[] = [];
  const rightOffsets: number[] = [];

  for (let i = 0; i < columns.length; i++) {
    if (columns[i]!.fixed === 'left') {
      leftOffsets[i] = left;
      left += widths[i]!;
    }
  }
  for (let i = columns.length - 1; i >= 0; i--) {
    if (columns[i]!.fixed === 'right') {
      rightOffsets[i] = right;
      right += widths[i]!;
    }
  }

  return columns.map((column, i) => {
    if (column.fixed === 'left') {
      return { position: 'sticky', left: leftOffsets[i], zIndex: 2 };
    }
    if (column.fixed === 'right') {
      return { position: 'sticky', right: rightOffsets[i], zIndex: 2 };
    }
    return undefined;
  });
}
