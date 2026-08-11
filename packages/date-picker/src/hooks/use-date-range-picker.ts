import {
  calendarValueToDateString,
  getTodayString,
  isCalendarDateRange,
  toMonthString,
  type MonthString,
} from '@uikit-react/calendar-base';
import { useCallback, useMemo, useState } from 'react';
import type {
  CalendarDateRange,
  UseDateRangePickerOptions,
  UseDateRangePickerReturn,
} from '../types';
import { formatDateRange } from '../utils/format-date-range';

export function useDateRangePicker(
  options: UseDateRangePickerOptions = {},
): UseDateRangePickerReturn {
  const {
    value: controlledValue,
    defaultValue = null,
    onChange,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    numberOfMonths: numberOfMonthsOption = 1,
  } = options;

  const numberOfMonths = Math.max(1, Math.floor(numberOfMonthsOption) || 1);
  const [uncontrolledValue, setUncontrolledValue] = useState<CalendarDateRange | null>(
    defaultValue,
  );
  const [uncontrolledMonth, setUncontrolledMonth] = useState<MonthString>(
    defaultMonth ??
      toMonthString(calendarValueToDateString(controlledValue ?? defaultValue) ?? getTodayString()),
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const month = controlledMonth ?? uncontrolledMonth;
  const open = controlledOpen ?? uncontrolledOpen;

  const setValue = useCallback(
    (range: CalendarDateRange | null) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(range);
      }
      onChange?.(range);
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

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const selectRange = useCallback(
    (range: CalendarDateRange | null) => {
      setValue(range);
      if (closeOnSelect && range?.end !== null && range !== null) {
        setOpen(false);
      }
    },
    [closeOnSelect, setOpen, setValue],
  );

  const displayValue = useMemo(() => formatDateRange(value), [value]);

  return useMemo(
    () => ({
      value,
      setValue,
      month,
      setMonth,
      open,
      setOpen,
      numberOfMonths,
      displayValue,
      getTriggerProps: () => ({
        'aria-expanded': open,
        onClick: () => setOpen(!open),
      }),
      getCalendarProps: () => ({
        selectionMode: 'range' as const,
        value,
        month,
        numberOfMonths,
        onChange: (next) => {
          if (next === null) {
            selectRange(null);
            return;
          }
          if (isCalendarDateRange(next)) {
            selectRange(next);
          }
        },
        onMonthChange: setMonth,
      }),
    }),
    [displayValue, month, numberOfMonths, open, selectRange, setMonth, setOpen, setValue, value],
  );
}
