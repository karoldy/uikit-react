import { createElement, type MouseEvent } from 'react';
import type { CalendarDayProps } from '../types';
import { cx } from '../utils/cx';
import { parseDateString } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';

export function CalendarDay({
  cell,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  ...props
}: CalendarDayProps) {
  const {
    dayFormatter,
    isDisabled,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    isPreviewing,
    isToday,
    getDayOf,
    selectDate,
    setHoveredDate,
    selectionMode,
    showOutsideDays,
    slotProps,
    slots,
    disableDefaultStyles,
  } = useCalendarContext();
  const { y, m, d } = parseDateString(cell.date);

  if (!showOutsideDays && !cell.inCurrentMonth) {
    return (
      <span className={disableDefaultStyles ? undefined : 'uikit-cal__day uikit-cal__day--empty'} />
    );
  }

  const dayOfResult = getDayOf(cell.date, cell.inCurrentMonth);
  const disabled = isDisabled(cell.date, cell.inCurrentMonth);
  const selected = isSelected(cell.date);
  const rangeStart = selectionMode === 'range' && isRangeStart(cell.date);
  const rangeEnd = selectionMode === 'range' && isRangeEnd(cell.date);
  const inRange = selectionMode === 'range' && isInRange(cell.date);
  const preview = isPreviewing && inRange;
  const today = isToday(cell.date);
  const label = dayFormatter.format(new Date(y, m - 1, d));
  const DaySlot = slots?.day ?? 'button';
  const configuredProps = (slotProps?.day ?? {}) as Record<string, unknown>;
  const configuredOnClick = configuredProps.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const configuredOnMouseEnter = configuredProps.onMouseEnter as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const configuredOnMouseLeave = configuredProps.onMouseLeave as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const handleClick = composeClickHandlers(
    configuredOnClick,
    composeClickHandlers(onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined, () =>
      selectDate(cell.date),
    ),
  );
  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    configuredOnMouseEnter?.(event);
    (onMouseEnter as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
    if (!event.defaultPrevented && selectionMode === 'range' && !disabled) {
      setHoveredDate(cell.date);
    }
  };
  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    configuredOnMouseLeave?.(event);
    (onMouseLeave as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
  };
  const mergedProps: Record<string, unknown> = {
    ...configuredProps,
    ...props,
    disabled,
    className: cx(
      !disableDefaultStyles && 'uikit-cal__day',
      !disableDefaultStyles && selected && 'uikit-cal__day--selected',
      !disableDefaultStyles && rangeStart && 'uikit-cal__day--range-start',
      !disableDefaultStyles && rangeEnd && 'uikit-cal__day--range-end',
      !disableDefaultStyles && inRange && 'uikit-cal__day--in-range',
      !disableDefaultStyles && preview && 'uikit-cal__day--preview',
      !disableDefaultStyles && today && 'uikit-cal__day--today',
      !disableDefaultStyles && !cell.inCurrentMonth && 'uikit-cal__day--outside',
      !disableDefaultStyles && disabled && 'uikit-cal__day--disabled',
      dayOfResult.className,
      configuredProps.className as string | undefined,
      className,
    ),
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  // Custom slot components get explicit state; intrinsic elements only get DOM-safe props.
  if (typeof DaySlot !== 'string') {
    mergedProps.label = label;
    mergedProps.date = cell.date;
    mergedProps.selected = selected;
    mergedProps.today = today;
    mergedProps.outside = !cell.inCurrentMonth;
    mergedProps.rangeStart = rangeStart;
    mergedProps.rangeEnd = rangeEnd;
    mergedProps.inRange = inRange;
    mergedProps.preview = preview;
  }

  if (DaySlot === 'button') {
    mergedProps.type = 'button';
  } else if (mergedProps.type === undefined) {
    delete mergedProps.type;
  }

  return createElement(DaySlot, mergedProps, children ?? d);
}
