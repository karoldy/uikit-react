import type {
  CalendarSlotProps,
  CalendarSlots,
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
    onChange: (date: DateString | null) => void;
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
    Omit<UseCalendarOptions, keyof UseDatePickerOptions>,
    Omit<UsePopoverOptions, 'open' | 'defaultOpen' | 'onOpenChange'> {
  asChild?: boolean;
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  calendarSlots?: CalendarSlots;
  calendarSlotProps?: CalendarSlotProps;
  slotProps?: DatePickerSlotProps;
}
