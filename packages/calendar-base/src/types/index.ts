import type * as React from 'react';
import type { CalendarCell } from '../utils/calendar-matrix';
import type { DateString, MonthString } from '../utils/date-string';

export interface CalendarMonthPanel {
  month: MonthString;
  cells: CalendarCell[];
}

export type CalendarView = 'year' | 'month' | 'day';
export type WeekdayFormat = 'narrow' | 'short' | 'long';
export type MonthSlideDirection = 'up' | 'down' | null;
export type ViewTransition = 'enlarge' | 'reduce' | null;
export type CalendarSelectionMode = 'single' | 'range';

/** Range selection value. `end` is `null` while picking the second date. */
export interface CalendarDateRange {
  start: DateString;
  end: DateString | null;
}

export type CalendarValue = DateString | CalendarDateRange | null;

/** Metadata passed to {@link UseCalendarOptions.dayOf}. */
export interface CalendarDayOfInfo {
  date: DateString;
  /** `0` Sunday … `6` Saturday (local). */
  dayOfWeek: number;
  isWeekend: boolean;
  isToday: boolean;
  inCurrentMonth: boolean;
}

/** Return value of {@link UseCalendarOptions.dayOf}. */
export interface CalendarDayOfResult {
  /** Disable this day (holiday, non-working day, etc.). */
  disabled?: boolean;
  /** Extra class names merged onto the day control. */
  className?: string;
}

export type CalendarDayOf = (info: CalendarDayOfInfo) => CalendarDayOfResult | void;

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
  /** Individual year cell in year view. */
  year?: React.ElementType;
  yearSelect?: React.ElementType;
  /** Individual month cell in month view. */
  month?: React.ElementType;
  monthGrid?: React.ElementType;
  panels?: React.ElementType;
  panel?: React.ElementType;
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
  year?: SlotPropsOf<React.ElementType>;
  yearSelect?: SlotPropsOf<React.ElementType>;
  month?: SlotPropsOf<React.ElementType>;
  monthGrid?: SlotPropsOf<React.ElementType>;
  panels?: SlotPropsOf<React.ElementType>;
  panel?: SlotPropsOf<React.ElementType>;
}

export interface UseCalendarOptions {
  /** `@default 'single'` */
  selectionMode?: CalendarSelectionMode;
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
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
  /**
   * Per-day customization from outside data (holidays, overtime weekends, …).
   * Return `{ disabled, className }`. Combines with `min` / `max` / `isDateDisabled`.
   */
  dayOf?: CalendarDayOf;
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
  /**
   * How many consecutive months to show in day view.
   * `month` is the first visible month. Default `1`.
   */
  numberOfMonths?: number;
  /**
   * Whether days from adjacent months fill the day grid.
   * When `false`, those cells stay empty (layout preserved). Default `true`.
   */
  showOutsideDays?: boolean;
}

export interface UseCalendarReturn {
  selectionMode: CalendarSelectionMode;
  value: CalendarValue;
  setValue: (value: CalendarValue) => void;
  month: MonthString;
  setMonth: (month: MonthString) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  views: CalendarView[];
  year: number;
  yearRangeStart: number;
  numberOfMonths: number;
  /** Whether adjacent-month days are shown in the grid. */
  showOutsideDays: boolean;
  /** Visible months starting at `month` (length = `numberOfMonths`). */
  months: MonthString[];
  /** Day grids for each visible month. */
  panels: CalendarMonthPanel[];
  /** Cells for the first visible month (compat). */
  cells: CalendarCell[];
  weekStartsOn: number;
  locale: string;
  weekdayFormat: WeekdayFormat;
  monthFormatter: Intl.DateTimeFormat;
  weekdayFormatter: Intl.DateTimeFormat;
  dayFormatter: Intl.DateTimeFormat;
  yearFormatter: Intl.DateTimeFormat;
  monthOnlyFormatter: Intl.DateTimeFormat;
  highlightedRange: CalendarDateRange | null;
  /** True while choosing the end date and a day is hovered. */
  isPreviewing: boolean;
  hoveredDate: DateString | null;
  isSelected: (date: DateString) => boolean;
  isRangeStart: (date: DateString) => boolean;
  isRangeEnd: (date: DateString) => boolean;
  isInRange: (date: DateString) => boolean;
  isDisabled: (date: DateString, inCurrentMonth?: boolean) => boolean;
  isToday: (date: DateString) => boolean;
  /** Resolve `dayOf` for a date (uses `inCurrentMonth: true` when omitted). */
  getDayOf: (date: DateString, inCurrentMonth?: boolean) => CalendarDayOfResult;
  selectDate: (date: DateString) => void;
  setHoveredDate: (date: DateString | null) => void;
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
export interface CalendarHeadingProps extends React.HTMLAttributes<HTMLElement> {
  /** Override which month label to show (day view / multi-month panels). */
  month?: MonthString;
  /** When false, heading is not a drill-up control. Default: auto from views. */
  drillable?: boolean;
}
export type CalendarGridProps = React.HTMLAttributes<HTMLElement>;
export type CalendarWeekDaysProps = React.HTMLAttributes<HTMLElement>;
export interface CalendarDaysProps extends React.HTMLAttributes<HTMLElement> {
  /** Render days for this panel month. Defaults to the first visible month. */
  month?: MonthString;
}
export type CalendarYearSelectProps = React.HTMLAttributes<HTMLElement>;
export type CalendarMonthGridProps = React.HTMLAttributes<HTMLElement>;
export type CalendarPanelsProps = React.HTMLAttributes<HTMLElement>;
export type CalendarPanelProps = React.HTMLAttributes<HTMLElement>;

/**
 * Props injected into `slots.prevMonth` / `slots.nextMonth` (custom component).
 * Native fallback `<button>` only receives DOM-safe props.
 */
export interface CalendarNavSlotProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children?: React.ReactNode;
  /** Suggested control name (e.g. "Previous month") — apply as `aria-label` yourself if needed. */
  label: string;
  view: CalendarView;
}

/** @deprecated Use {@link CalendarNavSlotProps}. */
export type CalendarNavButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Props injected into `slots.heading` (custom component).
 * Native fallback only receives DOM-safe props.
 */
export interface CalendarHeadingSlotProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: React.ReactNode;
  /** Visible heading text. */
  label: string;
  view: CalendarView;
  /** Whether clicking drills to a coarser view. */
  drillable: boolean;
}

/**
 * Props injected into `slots.day` (custom component).
 * Calendar does not set `aria-*` / `data-*`; wire a11y in your slot if needed.
 * Native fallback `<button>` only receives DOM-safe props.
 */
export interface CalendarDaySlotProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children?: React.ReactNode;
  /** Localized full date label (e.g. for `aria-label`). */
  label: string;
  /** `YYYY-MM-DD` for this cell. */
  date: DateString;
  selected: boolean;
  today: boolean;
  /** Day belongs to an adjacent month in the grid. */
  outside: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  /** Range hover preview highlight. */
  preview: boolean;
}

/**
 * Props injected into `slots.year` (custom component).
 * Native fallback `<button>` only receives DOM-safe props.
 */
export interface CalendarYearSlotProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children?: React.ReactNode;
  year: number;
  label: string;
  selected: boolean;
}

/**
 * Props injected into `slots.month` (custom component).
 * Native fallback `<button>` only receives DOM-safe props.
 */
export interface CalendarMonthSlotProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children?: React.ReactNode;
  /** Month number `1`–`12`. */
  month: number;
  /** `YYYY-MM` value passed to `selectMonth`. */
  monthValue: MonthString;
  label: string;
  selected: boolean;
}

/** Compound `Calendar.Day` props (includes `cell` for custom composition). */
export interface CalendarDayProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  cell: CalendarCell;
  children?: React.ReactNode;
}
