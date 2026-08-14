import { describe, expect, it } from 'vitest';
import { prefixSums, resolveColumnWidths } from '../src/utils/column-widths';

describe('resolveColumnWidths', () => {
  it('纯 width 不拉伸', () => {
    expect(resolveColumnWidths([{ width: 80 }, { width: 120 }], 400)).toEqual([80, 120]);
  });

  it('flex 分剩余空间', () => {
    expect(resolveColumnWidths([{ width: 100 }, { flex: 1 }, { flex: 1 }], 300)).toEqual([
      100, 100, 100,
    ]);
  });

  it('minWidth 卡住', () => {
    expect(resolveColumnWidths([{ width: 50, minWidth: 80 }, { flex: 1 }], 200)).toEqual([80, 120]);
  });

  it('width 与 flex 都缺省当作 width: 0', () => {
    expect(resolveColumnWidths([{}, { width: 100 }], 400)).toEqual([0, 100]);
  });
});

describe('prefixSums', () => {
  it('length === widths.length + 1，末项为总和', () => {
    expect(prefixSums([80, 120])).toEqual([0, 80, 200]);
  });
});
