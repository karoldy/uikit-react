import {
  parseDateString,
  startOfMonth,
  toDateString,
  toMonthString,
  type DateString,
  type MonthString,
} from './date-string';

export interface CalendarCell {
  date: DateString;
  inCurrentMonth: boolean;
}

const MATRIX_SIZE = 42;

function addDays(date: DateString, delta: number): DateString {
  const { y, m, d } = parseDateString(date);
  const next = new Date(y, m - 1, d + delta);
  return toDateString(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

function getDayOfWeek(date: DateString): number {
  const { y, m, d } = parseDateString(date);
  return new Date(y, m - 1, d).getDay();
}

export function buildCalendarMatrix(month: MonthString, weekStartsOn = 1): CalendarCell[] {
  const firstOfMonth = startOfMonth(month);
  const leadingDays = (getDayOfWeek(firstOfMonth) - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstOfMonth, -leadingDays);

  return Array.from({ length: MATRIX_SIZE }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      inCurrentMonth: toMonthString(date) === month,
    };
  });
}
