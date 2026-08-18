import { describe, expect, it } from 'vitest';
import { columnsOf, rowsOf } from '../src/utils/layout';

describe('layout', () => {
  it('columnsOf splits fixed columns and flexes the rest', () => {
    const columns = columnsOf(
      undefined,
      400,
      [],
      [
        { key: 'id', width: 80, fixed: 'start' },
        { key: 'name', minWidth: 100 },
        { key: 'actions', width: 60, fixed: 'end' },
      ],
    );

    expect(columns.width).toBe(400);
    expect(columns.start).toHaveLength(1);
    expect(columns.end).toHaveLength(1);
    expect(columns.center).toHaveLength(1);
    expect(columns.center[0]?.column.width).toBe(260);
  });

  it('rowsOf skips rows with zero height', () => {
    const rows = rowsOf(
      (row) => ((row as { skip?: boolean }).skip ? 0 : 32),
      [{ id: 1 }, { id: 2, skip: true }, { id: 3, fixed: 'start' }],
      [{ key: 'id' }],
    );

    expect(rows.all).toHaveLength(2);
    expect(rows.start).toHaveLength(1);
    expect(rows.height).toBe(64);
  });
});
