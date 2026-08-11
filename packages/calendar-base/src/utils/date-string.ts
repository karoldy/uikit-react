export type DateString = string;
export type MonthString = string;

const DATE_STRING_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_STRING_RE = /^(\d{4})-(\d{2})$/;

function isValidComponents(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) {
    return false;
  }

  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function isValidDateString(value: string): boolean {
  const match = DATE_STRING_RE.exec(value);
  if (!match) {
    return false;
  }

  return isValidComponents(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function parseDateString(value: string): {
  y: number;
  m: number;
  d: number;
} {
  if (!isValidDateString(value)) {
    throw new Error(`Invalid date string: ${value}`);
  }

  const match = DATE_STRING_RE.exec(value)!;
  return {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
  };
}

export function toDateString(y: number, m: number, d: number): DateString {
  if (!isValidComponents(y, m, d)) {
    throw new Error(`Invalid date components: ${y}-${m}-${d}`);
  }

  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function compareDateString(a: DateString, b: DateString): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function clampDateString(
  value: DateString,
  min?: DateString | null,
  max?: DateString | null,
): DateString {
  let result = value;

  if (min !== null && min !== undefined && compareDateString(result, min) < 0) {
    result = min;
  }

  if (max !== null && max !== undefined && compareDateString(result, max) > 0) {
    result = max;
  }

  return result;
}

export function toMonthString(value: DateString): MonthString {
  const { y, m } = parseDateString(value);
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`;
}

export function parseMonthString(month: MonthString): { y: number; m: number } {
  const match = MONTH_STRING_RE.exec(month);
  if (!match) {
    throw new Error(`Invalid month string: ${month}`);
  }

  const y = Number(match[1]);
  const m = Number(match[2]);
  if (m < 1 || m > 12) {
    throw new Error(`Invalid month string: ${month}`);
  }

  return { y, m };
}

export function getYear(month: MonthString): number {
  return parseMonthString(month).y;
}

export function monthStringFromParts(y: number, m: number): MonthString {
  if (m < 1 || m > 12) {
    throw new Error(`Invalid month: ${m}`);
  }
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`;
}

export function addYears(month: MonthString, delta: number): MonthString {
  const { y, m } = parseMonthString(month);
  return monthStringFromParts(y + delta, m);
}

export function addMonths(month: MonthString, delta: number): MonthString {
  const { y, m } = parseMonthString(month);
  const date = new Date(y, m - 1 + delta, 1);
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function startOfMonth(month: MonthString): DateString {
  const { y, m } = parseMonthString(month);
  return toDateString(y, m, 1);
}

export function getTodayString(): DateString {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
