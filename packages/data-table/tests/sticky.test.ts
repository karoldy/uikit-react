import { describe, expect, it } from 'vitest';
import { getStickyOffsets, getStickyStyle } from '../src/utils/sticky';
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

describe('getStickyStyle', () => {
  it('body 冻结列带底和不透明背景', () => {
    const offsets = getStickyOffsets(columns);
    expect(getStickyStyle(columns[0]!, offsets, 'cell')).toEqual({
      position: 'sticky',
      left: 0,
      right: undefined,
      zIndex: 1,
      background: 'var(--uikit-dt-bg)',
    });
  });

  it('header 冻结列 z-index 高于 body，并用表头底', () => {
    const offsets = getStickyOffsets(columns);
    expect(getStickyStyle(columns[0]!, offsets, 'header')).toEqual({
      position: 'sticky',
      left: 0,
      right: undefined,
      zIndex: 3,
      background: 'var(--uikit-dt-header-bg)',
    });
  });

  it('非冻结列返回 undefined', () => {
    const offsets = getStickyOffsets(columns);
    expect(getStickyStyle(columns[1]!, offsets, 'cell')).toBeUndefined();
  });
});
