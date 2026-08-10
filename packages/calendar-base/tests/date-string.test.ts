import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addMonths,
  clampDateString,
  compareDateString,
  getTodayString,
  isValidDateString,
  parseDateString,
  startOfMonth,
  toDateString,
  toMonthString,
} from '../src/utils/date-string';

describe('isValidDateString', () => {
  it('accepts valid calendar dates', () => {
    expect(isValidDateString('2026-08-10')).toBe(true);
    expect(isValidDateString('2024-02-29')).toBe(true);
    expect(isValidDateString('2000-01-01')).toBe(true);
  });

  it('rejects invalid calendar dates', () => {
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('2023-02-29')).toBe(false);
  });

  it('rejects malformed strings', () => {
    expect(isValidDateString('')).toBe(false);
    expect(isValidDateString('not-a-date')).toBe(false);
    expect(isValidDateString('2026-8-10')).toBe(false);
    expect(isValidDateString('2026-08-10T00:00:00')).toBe(false);
  });
});

describe('parseDateString', () => {
  it('parses valid date components', () => {
    expect(parseDateString('2026-08-10')).toEqual({ y: 2026, m: 8, d: 10 });
  });

  it('throws on invalid input', () => {
    expect(() => parseDateString('2026-02-30')).toThrow();
    expect(() => parseDateString('bad')).toThrow();
  });
});

describe('toDateString', () => {
  it('zero-pads month and day', () => {
    expect(toDateString(2026, 8, 10)).toBe('2026-08-10');
    expect(toDateString(2026, 1, 5)).toBe('2026-01-05');
  });

  it('throws for invalid calendar dates', () => {
    expect(() => toDateString(2026, 2, 30)).toThrow();
  });
});

describe('compareDateString', () => {
  it('orders dates lexicographically', () => {
    expect(compareDateString('2026-01-01', '2026-12-31')).toBeLessThan(0);
    expect(compareDateString('2026-12-31', '2026-01-01')).toBeGreaterThan(0);
    expect(compareDateString('2026-08-10', '2026-08-10')).toBe(0);
  });
});

describe('clampDateString', () => {
  it('returns value when within bounds', () => {
    expect(clampDateString('2026-08-10', '2026-01-01', '2026-12-31')).toBe('2026-08-10');
  });

  it('clamps below min', () => {
    expect(clampDateString('2026-01-01', '2026-06-01', null)).toBe('2026-06-01');
  });

  it('clamps above max', () => {
    expect(clampDateString('2026-12-31', null, '2026-06-01')).toBe('2026-06-01');
  });

  it('ignores null/undefined bounds', () => {
    expect(clampDateString('2026-08-10', null, undefined)).toBe('2026-08-10');
  });
});

describe('toMonthString', () => {
  it('extracts YYYY-MM from a date string', () => {
    expect(toMonthString('2026-08-10')).toBe('2026-08');
  });
});

describe('addMonths', () => {
  it('subtracts months across year boundary', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('adds months within the same year', () => {
    expect(addMonths('2026-01', 2)).toBe('2026-03');
  });
});

describe('startOfMonth', () => {
  it('returns the first day of the month', () => {
    expect(startOfMonth('2026-08')).toBe('2026-08-01');
  });
});

describe('getTodayString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 30, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns local calendar day as YYYY-MM-DD', () => {
    expect(getTodayString()).toBe('2026-08-10');
  });
});
