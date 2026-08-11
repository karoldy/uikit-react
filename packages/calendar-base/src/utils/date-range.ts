import { compareDateString, type DateString } from './date-string';
import type { CalendarDateRange } from '../types';

export function isCalendarDateRange(value: unknown): value is CalendarDateRange {
  return (
    typeof value === 'object' &&
    value !== null &&
    'start' in value &&
    typeof (value as CalendarDateRange).start === 'string'
  );
}

export function normalizeDateRange(range: CalendarDateRange): CalendarDateRange {
  if (range.end === null) {
    return { start: range.start, end: null };
  }

  if (compareDateString(range.start, range.end) <= 0) {
    return { start: range.start, end: range.end };
  }

  return { start: range.end, end: range.start };
}

export function isRangeStart(range: CalendarDateRange | null, date: DateString): boolean {
  return range?.start === date;
}

export function isRangeEnd(range: CalendarDateRange | null, date: DateString): boolean {
  return range?.end !== null && range?.end === date;
}

/** Inclusive membership in a complete range. */
export function isDateInRange(range: CalendarDateRange | null, date: DateString): boolean {
  if (!range || range.end === null) {
    return false;
  }

  return compareDateString(date, range.start) >= 0 && compareDateString(date, range.end) <= 0;
}

/**
 * While choosing the end date, treat `hoveredDate` as a temporary end for preview.
 * Complete ranges ignore hover.
 */
export function resolveHighlightedRange(
  range: CalendarDateRange | null,
  hoveredDate: DateString | null,
): CalendarDateRange | null {
  if (!range) {
    return null;
  }

  if (range.end !== null || !hoveredDate) {
    return range.end === null ? range : normalizeDateRange(range);
  }

  return normalizeDateRange({ start: range.start, end: hoveredDate });
}

export function calendarValueToDateString(
  value: DateString | CalendarDateRange | null | undefined,
): DateString | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return value.start;
}
