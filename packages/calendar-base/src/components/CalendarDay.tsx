import { createElement, type MouseEvent } from 'react';
import type { CalendarDayProps } from '../types';
import { parseDateString } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';

export function CalendarDay({ cell, children, onClick, ...props }: CalendarDayProps) {
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
