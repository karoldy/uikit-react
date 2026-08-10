import { createElement, type MouseEvent, type ReactNode } from 'react';
import { useCalendar } from '../hooks/use-calendar';
import type {
  CalendarDayProps,
  CalendarDaysProps,
  CalendarGridProps,
  CalendarHeaderProps,
  CalendarHeadingProps,
  CalendarNavButtonProps,
  CalendarProps,
  CalendarRootProps,
  CalendarWeekDaysProps,
} from '../types';
import { parseDateString, startOfMonth } from '../utils/date-string';
import { CalendarContext, useCalendarContext } from './calendar-context';

function CalendarRoot<TDay extends React.ElementType = 'button'>({
  value,
  defaultValue,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale,
  slots,
  slotProps,
  children,
  ...props
}: CalendarRootProps<TDay>) {
  const calendar = useCalendar({
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn,
    locale,
  });

  return (
    <CalendarContext.Provider
      value={{
        ...calendar,
        slots: slots as CalendarRootProps<React.ElementType>['slots'],
        slotProps: slotProps as CalendarRootProps<React.ElementType>['slotProps'],
      }}
    >
      <div {...props}>{children}</div>
    </CalendarContext.Provider>
  );
}

function CalendarHeader(props: CalendarHeaderProps) {
  return <div {...props} />;
}

function CalendarPrevMonth({
  children = 'Previous month',
  onClick,
  ...props
}: CalendarNavButtonProps) {
  const { goToPrevMonth } = useCalendarContext();
  return (
    <button
      type="button"
      aria-label="Previous month"
      {...props}
      onClick={composeClickHandlers(
        onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
        goToPrevMonth,
      )}
    >
      {children}
    </button>
  );
}

function CalendarNextMonth({ children = 'Next month', onClick, ...props }: CalendarNavButtonProps) {
  const { goToNextMonth } = useCalendarContext();
  return (
    <button
      type="button"
      aria-label="Next month"
      {...props}
      onClick={composeClickHandlers(
        onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
        goToNextMonth,
      )}
    >
      {children}
    </button>
  );
}

function CalendarHeading(props: CalendarHeadingProps) {
  const { month, monthFormatter } = useCalendarContext();
  const { y, m } = parseDateString(startOfMonth(month));
  const label = monthFormatter.format(new Date(y, m - 1, 1));

  return <h2 {...props}>{props.children ?? label}</h2>;
}

function CalendarGrid({ children, ...props }: CalendarGridProps) {
  return (
    <div role="grid" {...props}>
      {children}
    </div>
  );
}

function getWeekDays(formatter: Intl.DateTimeFormat, weekStartsOn: number): string[] {
  const sunday = new Date(2026, 7, 2);
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2026, 7, sunday.getDate() + ((weekStartsOn + index) % 7))),
  );
}

function CalendarWeekDays({ children, ...props }: CalendarWeekDaysProps) {
  const { weekdayFormatter, weekStartsOn } = useCalendarContext();
  return (
    <div role="row" {...props}>
      {children ??
        getWeekDays(weekdayFormatter, weekStartsOn).map((label, index) => (
          <div role="columnheader" key={index}>
            {label}
          </div>
        ))}
    </div>
  );
}

function composeClickHandlers(
  external: ((event: MouseEvent<HTMLElement>) => void) | undefined,
  internal: (event: MouseEvent<HTMLElement>) => void,
) {
  return (event: MouseEvent<HTMLElement>) => {
    external?.(event);
    if (!event.defaultPrevented) {
      internal(event);
    }
  };
}

function CalendarDay({ cell, children, onClick, ...props }: CalendarDayProps) {
  const { dayFormatter, isDisabled, isSelected, isToday, selectDate, slotProps, slots } =
    useCalendarContext();
  const { y, m, d } = parseDateString(cell.date);
  const disabled = isDisabled(cell.date);
  const label = dayFormatter.format(new Date(y, m - 1, d));
  const DaySlot = slots?.day ?? 'button';
  const configuredProps = slotProps?.day ?? {};
  const configuredOnClick = configuredProps.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const handleClick = composeClickHandlers(
    configuredOnClick,
    composeClickHandlers(onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined, () =>
      selectDate(cell.date),
    ),
  );
  const mergedProps: Record<string, unknown> = {
    ...configuredProps,
    ...props,
    'aria-label': props['aria-label'] ?? configuredProps['aria-label'] ?? label,
    disabled,
    'data-selected': isSelected(cell.date) || undefined,
    'data-today': isToday(cell.date) || undefined,
    'data-outside-month': !cell.inCurrentMonth || undefined,
    'data-disabled': disabled || undefined,
    onClick: handleClick,
  };

  if (DaySlot === 'button') {
    mergedProps.type = 'button';
  } else if (mergedProps.type === undefined) {
    delete mergedProps.type;
  }

  return <div role="gridcell">{createElement(DaySlot, mergedProps, children ?? d)}</div>;
}

function CalendarDays({ children, ...props }: CalendarDaysProps) {
  const { cells } = useCalendarContext();
  const rows: ReactNode[] = [];

  for (let row = 0; row < 6; row += 1) {
    rows.push(
      <div role="row" key={row}>
        {cells.slice(row * 7, row * 7 + 7).map((cell) => (
          <CalendarDay cell={cell} key={cell.date} />
        ))}
      </div>,
    );
  }

  return (
    <div {...props} role="rowgroup">
      {children ?? rows}
    </div>
  );
}

function CalendarDefault<TDay extends React.ElementType = 'button'>(props: CalendarProps<TDay>) {
  return (
    <CalendarRoot {...props}>
      <CalendarHeader>
        <CalendarPrevMonth />
        <CalendarHeading />
        <CalendarNextMonth />
      </CalendarHeader>
      <CalendarGrid>
        <CalendarWeekDays />
        <CalendarDays />
      </CalendarGrid>
    </CalendarRoot>
  );
}

export const Calendar = Object.assign(CalendarDefault, {
  Root: CalendarRoot,
  Header: CalendarHeader,
  PrevMonth: CalendarPrevMonth,
  NextMonth: CalendarNextMonth,
  Heading: CalendarHeading,
  Grid: CalendarGrid,
  WeekDays: CalendarWeekDays,
  Days: CalendarDays,
  Day: CalendarDay,
});
