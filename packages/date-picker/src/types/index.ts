import type {
  CalendarDateRange,
  CalendarSlotProps,
  CalendarSlots,
  CalendarValue,
  DateString,
  MonthString,
  UseCalendarOptions,
} from '@uikit-react/calendar-base';
import type {
  PopoverContentProps,
  PopoverTriggerProps,
  UsePopoverOptions,
} from '@uikit-react/popover';
import type * as React from 'react';

export type { CalendarDateRange };

export interface UseDatePickerOptions {
  value?: DateString | null;
  defaultValue?: DateString | null;
  onChange?: (date: DateString | null) => void;
  month?: MonthString;
  defaultMonth?: MonthString;
  onMonthChange?: (month: MonthString) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
}

export interface UseDatePickerReturn {
  value: DateString | null;
  setValue: (date: DateString | null) => void;
  month: MonthString;
  setMonth: (month: MonthString) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectDate: (date: DateString) => void;
  getTriggerProps: () => {
    'aria-expanded': boolean;
    onClick: () => void;
  };
  getCalendarProps: () => {
    value: DateString | null;
    month: MonthString;
    onChange: (value: CalendarValue) => void;
    onMonthChange: (month: MonthString) => void;
  };
}

export interface DatePickerSlotProps {
  trigger?: Omit<PopoverTriggerProps, 'asChild' | 'children'>;
  content?: PopoverContentProps;
}

export interface DatePickerProps
  extends
    UseDatePickerOptions,
    Omit<UseCalendarOptions, keyof UseDatePickerOptions | 'selectionMode'>,
    Omit<UsePopoverOptions, 'open' | 'defaultOpen' | 'onOpenChange'> {
  asChild?: boolean;
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  calendarSlots?: CalendarSlots;
  calendarSlotProps?: CalendarSlotProps;
  slotProps?: DatePickerSlotProps;
}

export interface UseDateRangePickerOptions {
  value?: CalendarDateRange | null;
  defaultValue?: CalendarDateRange | null;
  onChange?: (range: CalendarDateRange | null) => void;
  month?: MonthString;
  defaultMonth?: MonthString;
  onMonthChange?: (month: MonthString) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Close the popover when both ends are selected.
   * First click never closes. Default `true`.
   */
  closeOnSelect?: boolean;
  /** Visible months in the calendar. Default `1`. Use `2` for dual panels. */
  numberOfMonths?: number;
}

export interface UseDateRangePickerReturn {
  value: CalendarDateRange | null;
  setValue: (range: CalendarDateRange | null) => void;
  month: MonthString;
  setMonth: (month: MonthString) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  numberOfMonths: number;
  displayValue: string | null;
  getTriggerProps: () => {
    'aria-expanded': boolean;
    onClick: () => void;
  };
  getCalendarProps: () => {
    selectionMode: 'range';
    value: CalendarDateRange | null;
    month: MonthString;
    numberOfMonths: number;
    onChange: (value: CalendarValue) => void;
    onMonthChange: (month: MonthString) => void;
  };
}

export interface DateRangePickerProps
  extends
    UseDateRangePickerOptions,
    Omit<
      UseCalendarOptions,
      keyof UseDateRangePickerOptions | 'selectionMode' | 'value' | 'defaultValue' | 'onChange'
    >,
    Omit<UsePopoverOptions, 'open' | 'defaultOpen' | 'onOpenChange'> {
  asChild?: boolean;
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  /** Separator between start and end in the trigger label. Default ` – `. */
  separator?: string;
  calendarSlots?: CalendarSlots;
  calendarSlotProps?: CalendarSlotProps;
  slotProps?: DatePickerSlotProps;
}
