import type * as React from 'react';
import type { CalendarCell } from '../utils/calendar-matrix';
import type { DateString, MonthString } from '../utils/date-string';

export type CalendarView = 'year' | 'month' | 'day';
export type WeekdayFormat = 'narrow' | 'short' | 'long';
export type MonthSlideDirection = 'up' | 'down' | null;
export type ViewTransition = 'enlarge' | 'reduce' | null;

export const DEFAULT_VIEWS: CalendarView[] = ['year', 'month', 'day'];

export type SlotPropsOf<T extends React.ElementType> = Partial<React.ComponentPropsWithoutRef<T>>;

export interface CalendarAnimationClassNames {
  up?: string;
  down?: string;
  enlarge?: string;
  reduce?: string;
}

export interface CalendarSlots {
  root?: React.ElementType;
  header?: React.ElementType;
  prevMonth?: React.ElementType;
  nextMonth?: React.ElementType;
  heading?: React.ElementType;
  grid?: React.ElementType;
  weekDays?: React.ElementType;
  days?: React.ElementType;
  day?: React.ElementType;
  yearSelect?: React.ElementType;
  monthGrid?: React.ElementType;
}

export interface CalendarSlotProps {
  root?: SlotPropsOf<React.ElementType>;
  header?: SlotPropsOf<React.ElementType>;
  prevMonth?: SlotPropsOf<React.ElementType>;
  nextMonth?: SlotPropsOf<React.ElementType>;
  heading?: SlotPropsOf<React.ElementType>;
  grid?: SlotPropsOf<React.ElementType>;
  weekDays?: SlotPropsOf<React.ElementType>;
  days?: SlotPropsOf<React.ElementType>;
  day?: SlotPropsOf<React.ElementType>;
  yearSelect?: SlotPropsOf<React.ElementType>;
  monthGrid?: SlotPropsOf<React.ElementType>;
}

export interface UseCalendarOptions {
  value?: DateString | null;
  defaultValue?: DateString | null;
  onChange?: (date: DateString | null) => void;
  month?: MonthString;
  defaultMonth?: MonthString;
  onMonthChange?: (month: MonthString) => void;
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  views?: CalendarView[];
  min?: DateString;
  max?: DateString;
  isDateDisabled?: (date: DateString) => boolean;
  weekStartsOn?: number;
  locale?: string;
  weekdayFormat?: WeekdayFormat;
  /** Whether built-in transition tracking / classes run. Default `true`. */
  animated?: boolean;
  /**
   * Custom class names for transitions. Overrides defaults when set.
   * Use with your own CSS when `disableDefaultStyles` or to replace default keyframes.
   */
  animationClassNames?: CalendarAnimationClassNames;
  /** How long animation state classes stay applied (ms). Default `500`. */
  animationDuration?: number;
}

export interface UseCalendarReturn {
  value: DateString | null;
  setValue: (date: DateString | null) => void;
  month: MonthString;
  setMonth: (month: MonthString) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  views: CalendarView[];
  year: number;
  yearRangeStart: number;
  cells: CalendarCell[];
  weekStartsOn: number;
  locale: string;
  weekdayFormat: WeekdayFormat;
  monthFormatter: Intl.DateTimeFormat;
  weekdayFormatter: Intl.DateTimeFormat;
  dayFormatter: Intl.DateTimeFormat;
  yearFormatter: Intl.DateTimeFormat;
  monthOnlyFormatter: Intl.DateTimeFormat;
  isSelected: (date: DateString) => boolean;
  isDisabled: (date: DateString) => boolean;
  isToday: (date: DateString) => boolean;
  selectDate: (date: DateString) => void;
  selectMonth: (month: MonthString) => void;
  selectYear: (year: number) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  drillUp: () => void;
  monthSlideDirection: MonthSlideDirection;
  viewTransition: ViewTransition;
  animated: boolean;
  animationClassNames?: CalendarAnimationClassNames;
  animationDuration: number;
}

export interface CalendarRootProps
  extends
    UseCalendarOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  slots?: CalendarSlots;
  slotProps?: CalendarSlotProps;
  disableDefaultStyles?: boolean;
}

export type CalendarProps = Omit<CalendarRootProps, 'children'>;

export type CalendarHeaderProps = React.HTMLAttributes<HTMLElement>;
export type CalendarHeadingProps = React.HTMLAttributes<HTMLElement>;
export type CalendarGridProps = React.HTMLAttributes<HTMLElement>;
export type CalendarWeekDaysProps = React.HTMLAttributes<HTMLElement>;
export type CalendarDaysProps = React.HTMLAttributes<HTMLElement>;
export type CalendarNavButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type CalendarYearSelectProps = React.HTMLAttributes<HTMLElement>;
export type CalendarMonthGridProps = React.HTMLAttributes<HTMLElement>;

export interface CalendarDayProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  cell: CalendarCell;
  children?: React.ReactNode;
}
