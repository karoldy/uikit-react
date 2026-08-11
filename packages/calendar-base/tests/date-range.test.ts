import { describe, expect, it } from 'vitest';
import {
  isDateInRange,
  isRangeEnd,
  isRangeStart,
  normalizeDateRange,
  resolveHighlightedRange,
} from '../src/utils/date-range';
import type { CalendarDateRange } from '../src/types';

describe('normalizeDateRange', () => {
  it('orders start before end', () => {
    expect(normalizeDateRange({ start: '2026-08-20', end: '2026-08-10' })).toEqual({
      start: '2026-08-10',
      end: '2026-08-20',
    });
  });

  it('keeps partial ranges with null end', () => {
    expect(normalizeDateRange({ start: '2026-08-10', end: null })).toEqual({
      start: '2026-08-10',
      end: null,
    });
  });
});

describe('range membership helpers', () => {
  const complete: CalendarDateRange = { start: '2026-08-10', end: '2026-08-15' };
  const partial: CalendarDateRange = { start: '2026-08-10', end: null };

  it('detects range ends', () => {
    expect(isRangeStart(complete, '2026-08-10')).toBe(true);
    expect(isRangeEnd(complete, '2026-08-15')).toBe(true);
    expect(isRangeEnd(partial, '2026-08-10')).toBe(false);
  });

  it('detects inclusive in-range dates', () => {
    expect(isDateInRange(complete, '2026-08-12')).toBe(true);
    expect(isDateInRange(complete, '2026-08-10')).toBe(true);
    expect(isDateInRange(complete, '2026-08-09')).toBe(false);
    expect(isDateInRange(partial, '2026-08-12')).toBe(false);
  });
});

describe('resolveHighlightedRange', () => {
  it('uses hover as temporary end while selecting', () => {
    expect(resolveHighlightedRange({ start: '2026-08-10', end: null }, '2026-08-14')).toEqual({
      start: '2026-08-10',
      end: '2026-08-14',
    });
  });

  it('orders hover before the anchor start', () => {
    expect(resolveHighlightedRange({ start: '2026-08-15', end: null }, '2026-08-10')).toEqual({
      start: '2026-08-10',
      end: '2026-08-15',
    });
  });

  it('ignores hover when range is complete', () => {
    expect(
      resolveHighlightedRange({ start: '2026-08-10', end: '2026-08-12' }, '2026-08-20'),
    ).toEqual({ start: '2026-08-10', end: '2026-08-12' });
  });

  it('ignores hover when there is no selecting range', () => {
    expect(resolveHighlightedRange(null, '2026-08-14')).toBeNull();
  });
});
