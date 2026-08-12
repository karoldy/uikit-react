import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePagination } from '../src/hooks/use-pagination';

describe('usePagination', () => {
  it('默认第 1 页,pageSize 10', () => {
    const { result } = renderHook(() => usePagination({ total: 25 }));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.start).toBe(0);
    expect(result.current.end).toBe(10);
    expect(result.current.canPrev).toBe(false);
    expect(result.current.canNext).toBe(true);
  });

  it('nextPage / prevPage 翻页并更新切片', () => {
    const { result } = renderHook(() => usePagination({ total: 25 }));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.start).toBe(10);
    expect(result.current.end).toBe(20);
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
  });

  it('末页不越界,canNext 为 false', () => {
    const { result } = renderHook(() => usePagination({ total: 25, defaultPage: 3 }));
    expect(result.current.page).toBe(3);
    expect(result.current.canNext).toBe(false);
    expect(result.current.end).toBe(25);
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(3);
  });

  it('页码越界自动 clamp(如删行后总页数减少)', () => {
    const { result, rerender } = renderHook(
      ({ total }: { total: number }) => usePagination({ total, defaultPage: 5 }),
      { initialProps: { total: 50 } },
    );
    expect(result.current.page).toBe(5);
    rerender({ total: 10 });
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(1);
  });

  it('受控模式由外部 page 驱动,onPageChange 回调', () => {
    const onPageChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => usePagination({ total: 25, page, onPageChange }),
      { initialProps: { page: 1 } },
    );
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(1); // 受控,内部不推进
    expect(onPageChange).toHaveBeenCalledWith(2);
    rerender({ page: 2 });
    expect(result.current.page).toBe(2);
  });

  it('空数据安全', () => {
    const { result } = renderHook(() => usePagination({ total: 0 }));
    expect(result.current.pageCount).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.canPrev).toBe(false);
    expect(result.current.canNext).toBe(false);
    expect(result.current.start).toBe(0);
    expect(result.current.end).toBe(0);
  });
});
