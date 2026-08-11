import type { MouseEvent } from 'react';
import type { CalendarDaysProps } from '../types';
import { resolveMonthSlideClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { CalendarDay } from './CalendarDay';
import { renderSlot } from './render-slot';

export function CalendarDays({
  className,
  children,
  onMouseLeave,
  month: panelMonth,
  ...props
}: CalendarDaysProps) {
  const {
    panels,
    cells,
    slots,
    slotProps,
    disableDefaultStyles,
    selectionMode,
    setHoveredDate,
    numberOfMonths,
    animated,
    animationClassNames,
    monthSlideDirection,
  } = useCalendarContext();
  const configured = (slotProps?.days ?? {}) as Record<string, unknown>;
  const configuredOnMouseLeave = configured.onMouseLeave as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const panelCells =
    panelMonth === undefined
      ? cells
      : (panels.find((panel) => panel.month === panelMonth)?.cells ?? cells);

  return renderSlot(
    slots?.days,
    'div',
    {
      ...props,
      ...configured,
      onMouseLeave: (event: MouseEvent<HTMLElement>) => {
        configuredOnMouseLeave?.(event);
        onMouseLeave?.(event);
        // Multi-month clears hover on the panels wrapper so preview can span panels.
        if (!event.defaultPrevented && selectionMode === 'range' && numberOfMonths === 1) {
          setHoveredDate(null);
        }
      },
      className: cx(
        !disableDefaultStyles && 'uikit-cal__days',
        ...resolveMonthSlideClassNames(
          animated,
          disableDefaultStyles,
          animationClassNames,
          monthSlideDirection,
        ),
        configured.className as string | undefined,
        className,
      ),
    },
    children ??
      panelCells.map((cell) => (
        <CalendarDay cell={cell} key={`${panelMonth ?? 'primary'}-${cell.date}`} />
      )),
  );
}
