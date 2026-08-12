import { describe, expect, it } from 'vitest';
import { compareValues, sortRows } from '../src/utils/sort-rows';
import type { TableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  score: number | null;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', accessor: 'name', header: 'Name' },
  { key: 'score', accessor: 'score', header: 'Score' },
];

const rows: Row[] = [
  { id: 0, name: 'bob', score: 30 },
  { id: 1, name: 'alice', score: 20 },
  { id: 2, name: 'carol', score: 20 },
  { id: 3, name: 'dave', score: null },
];

describe('compareValues', () => {
  it('null/undefined 沉底', () => {
    expect(compareValues(null, 1)).toBe(1);
    expect(compareValues(undefined, 'a')).toBe(1);
    expect(compareValues(1, null)).toBe(-1);
    expect(compareValues(null, null)).toBe(0);
    expect(compareValues(undefined, undefined)).toBe(0);
  });

  it('数字按数值、字符串按 locale 比较', () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues('apple', 'banana')).toBeLessThan(0);
  });
});

describe('sortRows', () => {
  it('未排序时返回原序副本', () => {
    expect(sortRows(rows, columns, {})).toEqual(rows);
    expect(sortRows(rows, columns, {})).not.toBe(rows);
  });

  it('升序排序', () => {
    const sorted = sortRows(rows, columns, { columnKey: 'name', direction: 'asc' });
    expect(sorted.map((r) => r.name)).toEqual(['alice', 'bob', 'carol', 'dave']);
  });

  it('降序排序', () => {
    const sorted = sortRows(rows, columns, { columnKey: 'name', direction: 'desc' });
    expect(sorted.map((r) => r.name)).toEqual(['dave', 'carol', 'bob', 'alice']);
  });

  it('null 值沉底(升序)', () => {
    const sorted = sortRows(rows, columns, { columnKey: 'score', direction: 'asc' });
    expect(sorted.map((r) => r.name)).toEqual(['alice', 'carol', 'bob', 'dave']);
  });

  it('稳定排序: 相同值保持原相对顺序', () => {
    const sorted = sortRows(rows, columns, { columnKey: 'score', direction: 'asc' });
    expect(sorted.slice(0, 2).map((r) => r.name)).toEqual(['alice', 'carol']);
  });

  it('不可排序的列被忽略', () => {
    const cols: TableColumn<Row>[] = [
      { key: 'name', accessor: 'name', header: 'Name', sortable: false },
    ];
    expect(sortRows(rows, cols, { columnKey: 'name', direction: 'asc' })).toEqual(rows);
  });

  it('未知列被忽略', () => {
    expect(sortRows(rows, columns, { columnKey: 'missing', direction: 'asc' })).toEqual(rows);
  });
});
