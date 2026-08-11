import {
  getTodayString,
  toMonthString,
  type DateString,
  type MonthString,
} from '@uikit-react/calendar-base';
import { useCallback, useMemo, useState } from 'react';
import type { UseDatePickerOptions, UseDatePickerReturn } from '../types';

export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
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
  } = options;

  const [uncontrolledValue, setUncontrolledValue] = useState<DateString | null>(defaultValue);
  const [uncontrolledMonth, setUncontrolledMonth] = useState<MonthString>(
    defaultMonth ?? toMonthString(controlledValue ?? defaultValue ?? getTodayString()),
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const month = controlledMonth ?? uncontrolledMonth;
  const open = controlledOpen ?? uncontrolledOpen;

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

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const selectDate = useCallback(
    (date: DateString) => {
      setValue(date);
      if (closeOnSelect) {
        setOpen(false);
      }
    },
    [closeOnSelect, setOpen, setValue],
  );

  return useMemo(
    () => ({
      value,
      setValue,
      month,
      setMonth,
      open,
      setOpen,
      selectDate,
      getTriggerProps: () => ({
        'aria-expanded': open,
        onClick: () => setOpen(!open),
      }),
      getCalendarProps: () => ({
        value,
        month,
        onChange: (next: DateString | null | { start: DateString; end: DateString | null }) => {
          if (typeof next === 'string') {
            selectDate(next);
            return;
          }
          if (next === null) {
            setValue(null);
          }
        },
        onMonthChange: setMonth,
      }),
    }),
    [month, open, selectDate, setMonth, setOpen, setValue, value],
  );
}
