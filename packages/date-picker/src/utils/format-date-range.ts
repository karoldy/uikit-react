import type { CalendarDateRange } from '@uikit-react/calendar-base';

/** Format a range for triggers: `2026-08-10 – 2026-08-15` or `2026-08-10 – …`. */
export function formatDateRange(
  range: CalendarDateRange | null | undefined,
  separator = ' – ',
): string | null {
  if (!range) {
    return null;
  }
  if (range.end === null) {
    return `${range.start}${separator}…`;
  }
  return `${range.start}${separator}${range.end}`;
}
