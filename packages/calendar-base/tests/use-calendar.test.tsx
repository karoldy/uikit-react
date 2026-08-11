import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalendar } from '../src/hooks/use-calendar';

describe('useCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults month to today when no month or value is provided', () => {
    const { result } = renderHook(() => useCalendar());
    expect(result.current.month).toBe('2026-08');
    expect(result.current.view).toBe('day');
    expect(result.current.isToday('2026-08-10')).toBe(true);
  });

  it('supports uncontrolled selection and clearing', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: '2026-08', defaultValue: '2026-08-01', onChange }),
    );

    expect(result.current.value).toBe('2026-08-01');
    expect(result.current.isSelected('2026-08-01')).toBe(true);

    act(() => {
      result.current.selectDate('2026-08-15');
    });
    expect(result.current.value).toBe('2026-08-15');
    expect(onChange).toHaveBeenCalledWith('2026-08-15');

    act(() => {
      result.current.setValue(null);
    });
    expect(result.current.value).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('keeps controlled value until the parent updates it', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) =>
        useCalendar({ value, defaultMonth: '2026-08', onChange }),
      { initialProps: { value: '2026-08-10' } },
    );

    act(() => {
      result.current.selectDate('2026-08-15');
    });
    expect(result.current.value).toBe('2026-08-10');
    expect(onChange).toHaveBeenCalledWith('2026-08-15');

    rerender({ value: '2026-08-15' });
    expect(result.current.value).toBe('2026-08-15');
  });

  it('rejects setView values outside the whitelist', () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        defaultMonth: '2026-08',
        views: ['month', 'day'],
        onViewChange,
      }),
    );

    act(() => {
      result.current.setView('year');
    });
    expect(result.current.view).toBe('day');
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('selectYear and selectMonth drill into finer views', () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: '2026-08', defaultView: 'year' }),
    );

    act(() => {
      result.current.selectYear(2024);
    });
    expect(result.current.month).toBe('2024-08');
    expect(result.current.view).toBe('month');

    act(() => {
      result.current.selectMonth('2024-03');
    });
    expect(result.current.month).toBe('2024-03');
    expect(result.current.view).toBe('day');
  });

  it('goToPrev and goToNext adapt to the active view', () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: '2026-08', defaultView: 'day' }),
    );

    act(() => {
      result.current.goToPrev();
    });
    expect(result.current.month).toBe('2026-07');

    act(() => {
      result.current.goToNext();
    });
    expect(result.current.month).toBe('2026-08');

    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.goToNext();
    });
    expect(result.current.month).toBe('2027-08');

    act(() => {
      result.current.goToPrev();
    });
    expect(result.current.month).toBe('2026-08');

    act(() => {
      result.current.setView('year');
    });
    const start = result.current.yearRangeStart;
    act(() => {
      result.current.goToNext();
    });
    expect(result.current.yearRangeStart).toBe(start + 12);
    act(() => {
      result.current.goToPrev();
    });
    expect(result.current.yearRangeStart).toBe(start);
  });

  it('tracks month slide and view transition directions while animated', () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: '2026-08', animationDuration: 100 }),
    );

    act(() => {
      result.current.goToNextMonth();
    });
    expect(result.current.monthSlideDirection).toBe('up');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.monthSlideDirection).toBeNull();

    act(() => {
      result.current.goToPrevMonth();
    });
    expect(result.current.monthSlideDirection).toBe('down');

    act(() => {
      result.current.drillUp();
    });
    expect(result.current.viewTransition).toBe('reduce');

    act(() => {
      result.current.selectMonth('2026-08');
    });
    expect(result.current.viewTransition).toBe('enlarge');
  });

  it('clears transition state immediately when animated is false', () => {
    const { result } = renderHook(() => useCalendar({ defaultMonth: '2026-08', animated: false }));

    act(() => {
      result.current.goToNextMonth();
      result.current.drillUp();
    });

    expect(result.current.monthSlideDirection).toBeNull();
    expect(result.current.viewTransition).toBeNull();
  });
});
