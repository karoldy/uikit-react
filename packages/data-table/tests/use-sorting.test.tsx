import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSorting } from '../src/hooks/use-sorting';
import type { TableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', accessor: 'name', header: 'Name' },
  { key: 'id', accessor: 'id', header: 'ID', sortable: false },
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
  });

  it('toggleSort 三态循环 none → asc → desc → none', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({ columnKey: 'name', direction: 'asc' });
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['alice', 'bob']);
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({ columnKey: 'name', direction: 'desc' });
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({});
  });

  it('切换到另一列时重置为 asc', () => {
    const { result } = renderHook(() => useSorting({ data, columns }));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('id'));
    expect(result.current.sort).toEqual({ columnKey: 'id', direction: 'asc' });
  });

  it('受控模式由外部 props 驱动', () => {
    const { result, rerender } = renderHook(
      ({ sort }: { sort: { columnKey?: string; direction?: 'asc' | 'desc' } }) =>
        useSorting({ data, columns, sort }),
      { initialProps: { sort: {} } },
    );
    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({});
    rerender({ sort: { columnKey: 'name', direction: 'asc' } });
    expect(result.current.sort).toEqual({ columnKey: 'name', direction: 'asc' });
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['alice', 'bob']);
  });

  it('onSortChange 在切换时回调', () => {
    const onSortChange = vi.fn();
    const { result } = renderHook(() => useSorting({ data, columns, onSortChange }));
    act(() => result.current.toggleSort('name'));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'name', direction: 'asc' });
  });
});
