import { useCallback, useMemo, useState } from 'react';
import { buildCalendarMatrix } from '../utils/calendar-matrix';
import {
  addMonths,
  compareDateString,
  getTodayString,
  toMonthString,
  type DateString,
  type MonthString,
} from '../utils/date-string';
import type { UseCalendarOptions, UseCalendarReturn } from '../types';

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
    value: controlledValue,
    defaultValue = null,
    onChange,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn = 1,
    locale = 'en-US',
  } = options;

  const [uncontrolledValue, setUncontrolledValue] = useState<DateString | null>(defaultValue);
  const initialMonth =
    defaultMonth ?? toMonthString(controlledValue ?? defaultValue ?? getTodayString());
  const [uncontrolledMonth, setUncontrolledMonth] = useState<MonthString>(initialMonth);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const month = controlledMonth ?? uncontrolledMonth;

  const setValue = useCallback(
    (date: DateString | null) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(date);
      }
      onChange?.(date);
    },
    [controlledValue, onChange],
  );

  const setMonth = useCallback(
    (nextMonth: MonthString) => {
      if (controlledMonth === undefined) {
        setUncontrolledMonth(nextMonth);
      }
      onMonthChange?.(nextMonth);
    },
    [controlledMonth, onMonthChange],
  );

  const isSelected = useCallback((date: DateString) => value === date, [value]);
  const isDisabled = useCallback(
    (date: DateString) =>
      (min !== undefined && compareDateString(date, min) < 0) ||
      (max !== undefined && compareDateString(date, max) > 0) ||
      Boolean(isDateDisabled?.(date)),
    [isDateDisabled, max, min],
  );
  const today = getTodayString();
  const isToday = useCallback((date: DateString) => date === today, [today]);
  const selectDate = useCallback(
    (date: DateString) => {
      if (!isDisabled(date)) {
        setValue(date);
      }
    },
    [isDisabled, setValue],
  );
  const goToPrevMonth = useCallback(() => setMonth(addMonths(month, -1)), [month, setMonth]);
  const goToNextMonth = useCallback(() => setMonth(addMonths(month, 1)), [month, setMonth]);
  const cells = useMemo(() => buildCalendarMatrix(month, weekStartsOn), [month, weekStartsOn]);
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale],
  );
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  return {
    value,
    setValue,
    month,
    setMonth,
    cells,
    weekStartsOn,
    locale,
    monthFormatter,
    weekdayFormatter,
    dayFormatter,
    isSelected,
    isDisabled,
    isToday,
    selectDate,
    goToPrevMonth,
    goToNextMonth,
  };
}
