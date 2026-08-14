import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSorting } from '../src/sorting/use-sorting';
import type { SortableColumn } from '../src/sorting/types';

interface Row {
  id: number;
  name: string;
}

const columns: SortableColumn<Row>[] = [
  { key: 'name', accessor: 'name' },
  { key: 'id', accessor: 'id' },
];

const data: Row[] = [
  { id: 2, name: 'bob' },
  { id: 1, name: 'alice' },
];

describe('useSorting', () => {
  it('初始无排序,返回原序', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['bob', 'alice']);
    expect(result.current.getSortDirection('name')).toBeUndefined();
    expect(result.current.sort).toEqual([]);
  });

  it('toggleSort 三态循环 none → asc → desc → none', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual([{ columnKey: 'name', direction: 'asc' }]);
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['alice', 'bob']);
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual([{ columnKey: 'name', direction: 'desc' }]);
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual([]);
  });

  it('切换到另一列时重置为该列 asc', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('id'));
    expect(result.current.sort).toEqual([{ columnKey: 'id', direction: 'asc' }]);
  });

  it('multi: 追加第二列,循环后移除', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('id', { multi: true }));
    expect(result.current.sort).toEqual([
      { columnKey: 'name', direction: 'asc' },
      { columnKey: 'id', direction: 'asc' },
    ]);
    expect(result.current.getSortDirection('name')).toBe('asc');
    expect(result.current.getSortDirection('id')).toBe('asc');
    act(() => result.current.toggleSort('name', { multi: true }));
    expect(result.current.sort).toEqual([
      { columnKey: 'name', direction: 'desc' },
      { columnKey: 'id', direction: 'asc' },
    ]);
    act(() => result.current.toggleSort('name', { multi: true }));
    expect(result.current.sort).toEqual([{ columnKey: 'id', direction: 'asc' }]);
  });

  it('multiSort 时单击也追加', () => {
    const { result } = renderHook(() => useSorting({ data, columns, multiSort: true }));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('id'));
    expect(result.current.sort).toEqual([
      { columnKey: 'name', direction: 'asc' },
      { columnKey: 'id', direction: 'asc' },
    ]);
  });

  it('单击会替换已有的多列排序', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('id', { multi: true }));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('受控模式由外部 props 驱动,兼容单列对象', () => {
    const { result, rerender } = renderHook(
      ({
        sort,
      }: {
        sort:
          | { columnKey?: string; direction?: 'asc' | 'desc' }
          | { columnKey: string; direction: 'asc' | 'desc' }[];
      }) => useSorting({ data, columns, sort }),
      { initialProps: { sort: {} } },
    );
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual([]);
    rerender({ sort: { columnKey: 'name', direction: 'asc' } });
    expect(result.current.sort).toEqual([{ columnKey: 'name', direction: 'asc' }]);
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['alice', 'bob']);
  });

  it('onSortChange 在切换时回调数组', () => {
    const onSortChange = vi.fn();
    const { result } = renderHook(() => useSorting({ data, columns, onSortChange }));
    act(() => result.current.toggleSort('name'));
    expect(onSortChange).toHaveBeenCalledWith([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('非受控: toggle 后无排序变化的 rerender 保持 sortedRows 引用', () => {
    const { result, rerender } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    const sortedAfterToggle = result.current.sortedRows;
    const sortAfterToggle = result.current.sort;
    rerender();
    expect(result.current.sort).toBe(sortAfterToggle);
    expect(result.current.sortedRows).toBe(sortedAfterToggle);
  });
});
