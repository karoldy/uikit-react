import { describe, expect, it } from 'vitest';
import { columnsOf, rowsOf } from '../src/utils/layout';
import { mergeOf } from '../src/utils/merge';
import type { GridRow } from '../src/types/grid';

type Col = { key: string; width: number };
type Row = GridRow & { id: number };

describe('mergeOf', () => {
  it('computes merged geometry and renders only once per merge key', () => {
    const columns = [
      { key: 'c1', width: 50 },
      { key: 'c2', width: 60 },
      { key: 'c3', width: 70 },
    ] satisfies Col[];

    const data = [{ id: 0 }, { id: 1 }, { id: 2 }] as Row[];
    const gridWidth = 50 + 60 + 70;

    const columnLayout = columnsOf(undefined, gridWidth, data, columns);
    const rowLayout = rowsOf((row) => (row.id === 0 ? 10 : row.id === 1 ? 20 : 30), data, columns);

    const mergeController = mergeOf(
      (column, row) => {
        if (row.id !== 0 && row.id !== 1) return undefined;
        if (column.key !== 'c1' && column.key !== 'c2') return undefined;
        return { key: 'm' };
      },
      columnLayout as any,
      rowLayout as any,
    );

    expect(mergeController).toBeDefined();
    mergeController!.format();

    const c1Entry = columnLayout.center.find((e) => e.column.key === 'c1')!;
    const c2Entry = columnLayout.center.find((e) => e.column.key === 'c2')!;
    const r1Entry = rowLayout.center.find((e) => e.row.id === 0)!;
    const r2Entry = rowLayout.center.find((e) => e.row.id === 1)!;

    // viewport-relative positions (as sight() would set them)
    const c1Left = 0;
    const c2Left = c1Entry.column.width;
    const r1Top = 0;
    const r2Top = r1Entry.row.height;

    // First cell of the merge block → shouldRender = true
    const decision1 = mergeController!.cell({
      columnKey: 'c1',
      rowKey: r1Entry.key, // layout entry key used as row identity
      column: { left: c1Left, width: c1Entry.column.width, fixed: c1Entry.column.fixed },
      row: { top: r1Top, height: r1Entry.row.height, fixed: r1Entry.row.fixed },
    });

    expect(decision1.belongs).toBe(true);
    expect(decision1.shouldRender).toBe(true);
    expect(decision1.key).toBe('m');
    expect(decision1.width).toBe(c1Entry.column.width + c2Entry.column.width);
    expect(decision1.height).toBe(r1Entry.row.height + r2Entry.row.height);
    // top-left cell → absolute position = viewport coord − 0 intra-offset
    expect(decision1.left).toBe(c1Left);
    expect(decision1.top).toBe(r1Top);

    // Mark the block as drawn
    mergeController!.done('c1', r1Entry.key);

    // Another cell inside the same block → shouldRender = false
    const decision2 = mergeController!.cell({
      columnKey: 'c2',
      rowKey: r2Entry.key,
      column: { left: c2Left, width: c2Entry.column.width, fixed: c2Entry.column.fixed },
      row: { top: r2Top, height: r2Entry.row.height, fixed: r2Entry.row.fixed },
    });

    expect(decision2.belongs).toBe(true);
    expect(decision2.shouldRender).toBe(false);
  });

  it('merges rest fields from all cells in the block', () => {
    const columns = [
      { key: 'c1', width: 50 },
      { key: 'c2', width: 60 },
    ];
    const data = [{ id: 0 }, { id: 1 }] as Row[];
    const gridWidth = 110;

    const columnLayout = columnsOf(undefined, gridWidth, data, columns);
    const rowLayout = rowsOf(() => 20, data, columns);

    const controller = mergeOf(
      (column, row) => ({ key: 'x', col: column.key, rowId: row.id }),
      columnLayout as any,
      rowLayout as any,
    );

    expect(controller).toBeDefined();
    controller!.format();

    const c1Entry = columnLayout.center.find((e) => e.column.key === 'c1')!;
    const r0Entry = rowLayout.center[0]!;

    const d = controller!.cell({
      columnKey: 'c1',
      rowKey: r0Entry.key,
      column: { left: 0, width: c1Entry.column.width, fixed: c1Entry.column.fixed },
      row: { top: 0, height: r0Entry.row.height, fixed: r0Entry.row.fixed },
    });

    expect(d.shouldRender).toBe(true);
    // rest fields spread from last column/row pair wins; both col and rowId should be present
    expect((d as any).col).toBeDefined();
    expect((d as any).rowId).toBeDefined();
  });

  it('format() resets drawn state so blocks can render again next pass', () => {
    const columns = [{ key: 'c1', width: 50 }];
    const data = [{ id: 0 }] as Row[];

    const columnLayout = columnsOf(undefined, 50, data, columns);
    const rowLayout = rowsOf(() => 20, data, columns);

    const controller = mergeOf(() => ({ key: 'z' }), columnLayout as any, rowLayout as any);

    expect(controller).toBeDefined();

    const r0Entry = rowLayout.center[0]!;
    const args = {
      columnKey: 'c1',
      rowKey: r0Entry.key,
      column: { left: 0, width: 50, fixed: 'center' as const },
      row: { top: 0, height: 20, fixed: 'center' as const },
    };

    controller!.format();
    const first = controller!.cell(args);
    expect(first.shouldRender).toBe(true);
    controller!.done('c1', r0Entry.key);

    // Same pass, same cell → shouldRender = false
    const again = controller!.cell(args);
    expect(again.shouldRender).toBe(false);

    // After format(), should be renderable again
    controller!.format();
    const second = controller!.cell(args);
    expect(second.shouldRender).toBe(true);
  });
});
