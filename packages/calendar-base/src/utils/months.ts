import { addMonths, type MonthString } from './date-string';

/** Visible months starting at `startMonth` (inclusive). Count is clamped to ≥ 1. */
export function buildVisibleMonths(startMonth: MonthString, count: number): MonthString[] {
  const size = Math.max(1, Math.floor(count) || 1);
  return Array.from({ length: size }, (_, index) => addMonths(startMonth, index));
}
