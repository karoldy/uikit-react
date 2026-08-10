import type * as React from 'react';
import type { CalendarCell } from '../utils/calendar-matrix';
import type { DateString, MonthString } from '../utils/date-string';

export interface UseCalendarOptions {
  value?: DateString | null;
  defaultValue?: DateString | null;
  onChange?: (date: DateString | null) => void;
  month?: MonthString;
  defaultMonth?: MonthString;
  onMonthChange?: (month: MonthString) => void;
  min?: DateString;
  max?: DateString;
  isDateDisabled?: (date: DateString) => boolean;
  weekStartsOn?: number;
  locale?: string;
}

export interface UseCalendarReturn {
  value: DateString | null;
  setValue: (date: DateString | null) => void;
  month: MonthString;
  setMonth: (month: MonthString) => void;
  cells: CalendarCell[];
  weekStartsOn: number;
  locale: string;
  monthFormatter: Intl.DateTimeFormat;
  weekdayFormatter: Intl.DateTimeFormat;
  dayFormatter: Intl.DateTimeFormat;
  isSelected: (date: DateString) => boolean;
  isDisabled: (date: DateString) => boolean;
  isToday: (date: DateString) => boolean;
  selectDate: (date: DateString) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

export type SlotPropsOf<T extends React.ElementType> = Partial<React.ComponentPropsWithoutRef<T>>;

export interface CalendarSlots<TDay extends React.ElementType = 'button'> {
  day?: TDay;
}

export interface CalendarSlotProps<TDay extends React.ElementType = 'button'> {
  day?: SlotPropsOf<TDay>;
}

export interface CalendarRootProps<TDay extends React.ElementType = 'button'>
  extends
    UseCalendarOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  slots?: CalendarSlots<TDay>;
  slotProps?: CalendarSlotProps<TDay>;
}

export type CalendarProps<TDay extends React.ElementType = 'button'> = Omit<
  CalendarRootProps<TDay>,
  'children'
>;

export type CalendarHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type CalendarHeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
export type CalendarGridProps = React.HTMLAttributes<HTMLDivElement>;
export type CalendarWeekDaysProps = React.HTMLAttributes<HTMLDivElement>;
export type CalendarDaysProps = React.HTMLAttributes<HTMLDivElement>;
export type CalendarNavButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface CalendarDayProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  cell: CalendarCell;
  children?: React.ReactNode;
}
