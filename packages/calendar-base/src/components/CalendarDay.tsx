import { createElement, type MouseEvent } from 'react';
import type { CalendarDayProps } from '../types';
import { cx } from '../utils/cx';
import { parseDateString } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';

export function CalendarDay({ cell, children, onClick, className, ...props }: CalendarDayProps) {
  const {
    dayFormatter,
    isDisabled,
    isSelected,
    isToday,
    selectDate,
    slotProps,
    slots,
    disableDefaultStyles,
  } = useCalendarContext();
  const { y, m, d } = parseDateString(cell.date);
  const disabled = isDisabled(cell.date);
  const selected = isSelected(cell.date);
  const today = isToday(cell.date);
  const label = dayFormatter.format(new Date(y, m - 1, d));
  const DaySlot = slots?.day ?? 'button';
  const configuredProps = (slotProps?.day ?? {}) as Record<string, unknown>;
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
    'aria-label':
      props['aria-label'] ?? (configuredProps['aria-label'] as string | undefined) ?? label,
    'aria-pressed': selected || undefined,
    'aria-current': today ? 'date' : undefined,
    disabled,
    className: cx(
      !disableDefaultStyles && 'uikit-cal__day',
      !disableDefaultStyles && selected && 'uikit-cal__day--selected',
      !disableDefaultStyles && today && 'uikit-cal__day--today',
      !disableDefaultStyles && !cell.inCurrentMonth && 'uikit-cal__day--outside',
      !disableDefaultStyles && disabled && 'uikit-cal__day--disabled',
      configuredProps.className as string | undefined,
      className,
    ),
    onClick: handleClick,
  };

  if (DaySlot === 'button') {
    mergedProps.type = 'button';
  } else if (mergedProps.type === undefined) {
    delete mergedProps.type;
  }

  return (
    <div role="gridcell" className={disableDefaultStyles ? undefined : 'uikit-cal__cell'}>
      {createElement(DaySlot, mergedProps, children ?? d)}
    </div>
  );
}
