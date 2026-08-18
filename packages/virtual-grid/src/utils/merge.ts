import type { ColumnsLayout, LayoutFixed, RowsLayout } from './layout';
import type { MergeCellInfo } from '../types/grid';

type FixedBand = LayoutFixed;

// ------- Internal structures (mirrors uikit Merge object) -------

interface MergeCell {
  /** extra fields from mergeFn, merged across all cells in the block */
  rest: Record<string, unknown>;
  /** dominant fixed direction pair [columnFixed, rowFixed] — "more fixed" wins */
  fixed: FixedBand[];
  width: number;
  height: number;
  /** per-column accumulated left offset inside this block, keyed by column.key */
  columnWidth: Record<string, number>;
  /** per-row accumulated top offset inside this block, keyed by row.key */
  rowHeight: Record<string, number>;
}

interface CellMapping {
  /** merge block key */
  key: string;
  /** intra-block left offset (distance from block left edge) */
  left: number;
  /** intra-block top offset (distance from block top edge) */
  top: number;
}

// ------- Public types -------

export interface MergeDecision extends MergeCellInfo {
  /** true if this cell belongs to any merge block */
  belongs: boolean;
  /** true if this cell should be rendered as the merge representative */
  shouldRender: boolean;
}

export interface MergeController {
  /** Call before each render pass to reset the "already-drawn" set */
  format: () => void;
  /**
   * Query merge info for a single cell.
   * Mirrors uikit `Merge.cell(columnKey, rowKey)`:
   *   - belongs=false  → not part of any merge block
   *   - belongs=true, shouldRender=true  → first occurrence; caller renders merged cell
   *   - belongs=true, shouldRender=false → already rendered; caller skips
   */
  cell: (args: {
    /** column.key (business key, from GridColumn) */
    columnKey: string;
    /** row.key or layout entry key used as row identity */
    rowKey: string;
    /** viewport-relative geometry for this cell, written by sight() */
    column: { left?: number; width: number; fixed: FixedBand };
    row: { top?: number; height: number; fixed: FixedBand };
  }) => MergeDecision;
  /**
   * Mark a merge block as drawn after its representative cell has been rendered.
   * Mirrors uikit `Merge.done(columnKey, rowKey)`.
   */
  done: (columnKey: string, rowKey: string) => void;
}

// ------- Helper -------

function fixedCount(fixed: FixedBand[]): number {
  return fixed.filter((f) => f === 'start' || f === 'end').length;
}

function cellKey(columnKey: string, rowKey: string): string {
  return `${columnKey}_${rowKey}`;
}

// ------- Main factory (full uikit mergeOf semantics) -------

export function mergeOf(
  mergeFn:
    | ((column: any, row: any) => ({ key: string } & Record<string, unknown>) | null | undefined)
    | undefined,
  columns: ColumnsLayout<any>,
  rows: RowsLayout<any>,
): MergeController | undefined {
  if (!mergeFn) return undefined;

  // Flatten entries in the same order uikit uses: start → center → end
  const columnEntries = [...columns.start, ...columns.center, ...columns.end] as {
    key: string;
    column: { key: string; width: number; fixed: FixedBand };
  }[];
  const rowEntries = [...rows.start, ...rows.center, ...rows.end] as {
    key: string;
    row: { fixed: FixedBand; height: number; [k: string]: unknown };
  }[];

  // cells: merge-key → MergeCell
  const cells: Record<string, MergeCell> = {};
  // mappings: cellKey(colKey, rowKey) → CellMapping
  const mappings: Record<string, CellMapping> = {};

  function getOrCreateCell(key: string): MergeCell {
    if (!cells[key]) {
      cells[key] = { rest: {}, fixed: [], width: 0, height: 0, columnWidth: {}, rowHeight: {} };
    }
    return cells[key];
  }

  // Accumulate column width into a block; returns true if already counted (skip).
  function accumulateColumn(colKey: string, width: number, cell: MergeCell): boolean {
    if (typeof cell.columnWidth[colKey] === 'number') return true;
    cell.columnWidth[colKey] = cell.width; // record current running width as left-offset
    cell.width += width;
    return false;
  }

  // Accumulate row height into a block; returns true if already counted (skip).
  function accumulateRow(rowKey: string, height: number, cell: MergeCell): boolean {
    if (typeof cell.rowHeight[rowKey] === 'number') return true;
    cell.rowHeight[rowKey] = cell.height; // record current running height as top-offset
    cell.height += height;
    return false;
  }

  // Build phase — mirrors uikit's forEach loop
  for (const { column } of columnEntries) {
    for (const { row, key: rowEntryKey } of rowEntries) {
      const result = mergeFn(column, row);
      if (!result) continue;

      const { key, ...rest } = result;
      if (!key) continue;

      // Use business keys for deduplication (column.key + row entry key)
      const colKey = column.key as string;
      // Rows may not have a business .key; fall back to the layout entry key
      const rowKey = (row as { key?: string }).key ?? rowEntryKey;
      const ck = cellKey(colKey, rowKey);

      const mergeCell = getOrCreateCell(key);

      // Merge rest
      mergeCell.rest = { ...mergeCell.rest, ...rest };

      // Update dominant fixed direction: "more fixed" wins
      const incoming: FixedBand[] = [column.fixed, row.fixed];
      if (fixedCount(incoming) >= fixedCount(mergeCell.fixed)) {
        mergeCell.fixed = incoming;
      }

      // Ensure mapping exists
      if (!mappings[ck]) {
        mappings[ck] = { key, top: 0, left: 0 };
      }
      const mapping = mappings[ck];

      // Accumulate geometry — left/top offsets are recorded before adding to total
      const colAlreadyCounted = accumulateColumn(colKey, column.width, mergeCell);
      if (!colAlreadyCounted) {
        mapping.left = mergeCell.columnWidth[colKey]; // set to the pre-add offset
      }

      const rowAlreadyCounted = accumulateRow(rowKey, row.height, mergeCell);
      if (!rowAlreadyCounted) {
        mapping.top = mergeCell.rowHeight[rowKey]; // set to the pre-add offset
      }
    }
  }

  // Render phase: track drawn keys per render pass
  const drawnKeys: string[] = [];

  return {
    format() {
      drawnKeys.length = 0;
    },

    cell({ columnKey, rowKey, column, row }) {
      const ck = cellKey(columnKey, rowKey);
      const mapping = mappings[ck];

      if (!mapping) {
        return {
          belongs: false,
          shouldRender: false,
          key: '',
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          fixed: { column: 'center', row: 'center' },
        };
      }

      const { key, top: intraTop, left: intraLeft } = mapping;

      if (drawnKeys.indexOf(key) > -1) {
        // Already drawn this pass — skip
        return {
          belongs: true,
          shouldRender: false,
          key,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          fixed: { column: 'center', row: 'center' },
        };
      }

      // Not yet drawn — this cell is the representative
      const mergeCell = cells[key];
      const [fixedCol = 'center', fixedRow = 'center'] = mergeCell.fixed;

      return {
        ...mergeCell.rest,
        belongs: true,
        shouldRender: true,
        key,
        width: mergeCell.width,
        height: mergeCell.height,
        // Absolute viewport coordinate = current cell's viewport coord − intra-block offset
        left: (column.left ?? 0) - intraLeft,
        top: (row.top ?? 0) - intraTop,
        fixed: { column: fixedCol, row: fixedRow },
      } as unknown as MergeDecision;
    },

    done(columnKey: string, rowKey: string) {
      const ck = cellKey(columnKey, rowKey);
      const mapping = mappings[ck];
      if (mapping?.key) drawnKeys.push(mapping.key);
    },
  };
}
