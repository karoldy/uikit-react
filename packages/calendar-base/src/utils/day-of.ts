import { parseDateString, type DateString } from './date-string';
import type { CalendarDayOfInfo } from '../types';

/** Build day metadata for `dayOf` (local calendar). */
export function getCalendarDayOfInfo(
  date: DateString,
  options: { inCurrentMonth?: boolean; today?: DateString } = {},
): CalendarDayOfInfo {
  const { y, m, d } = parseDateString(date);
  const dayOfWeek = new Date(y, m - 1, d).getDay();
  return {
    date,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isToday: options.today !== undefined ? date === options.today : false,
    inCurrentMonth: options.inCurrentMonth ?? true,
  };
}
