import { describe, expect, it } from 'vitest';
import { getStickyOffsets } from '../src/utils/sticky';
import type { DataTableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  action: string;
}

const columns: DataTableColumn<Row>[] = [
  { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
  { key: 'name', accessor: 'name', header: 'Name', width: 200 },
  { key: 'action', accessor: 'action', header: 'Action', width: 80, fixed: 'right' },
];

describe('getStickyOffsets', () => {
  it('左固定列从左累计,右固定列从右累计', () => {
    const offsets = getStickyOffsets(columns);
    expect(offsets.get('id')).toEqual({ left: 0 });
    expect(offsets.get('name')).toEqual({});
    expect(offsets.get('action')).toEqual({ right: 0 });
  });

  it('多个同侧固定列正确累计', () => {
    const cols: DataTableColumn<Row>[] = [
      { key: 'a', accessor: 'id', header: 'A', width: 30, fixed: 'left' },
      { key: 'b', accessor: 'name', header: 'B', width: 70, fixed: 'left' },
      { key: 'c', accessor: 'action', header: 'C' },
    ];
    const offsets = getStickyOffsets(cols);
    expect(offsets.get('a')).toEqual({ left: 0 });
    expect(offsets.get('b')).toEqual({ left: 30 });
  });

  it('无 fixed 列返回空映射', () => {
    const offsets = getStickyOffsets([{ key: 'a', accessor: 'id', header: 'A' }]);
    expect(offsets.get('a')).toEqual({});
  });
});
