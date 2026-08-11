import type { MouseEvent } from 'react';
import type { CalendarHeadingProps } from '../types';
import { cx } from '../utils/cx';
import { parseDateString, parseMonthString, startOfMonth } from '../utils/date-string';
import { coarserView } from '../utils/views';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { renderSlot } from './render-slot';

export function CalendarHeading({ className, children, onClick, ...props }: CalendarHeadingProps) {
  const {
    month,
    view,
    views,
    yearRangeStart,
    monthFormatter,
    yearFormatter,
    drillUp,
    slots,
    slotProps,
    disableDefaultStyles,
  } = useCalendarContext();

  const { y, m } = parseDateString(startOfMonth(month));
  let label: string;
  if (view === 'year') {
    label = `${yearFormatter.format(new Date(yearRangeStart, 0, 1))} – ${yearFormatter.format(
      new Date(yearRangeStart + 11, 0, 1),
    )}`;
  } else if (view === 'month') {
    label = yearFormatter.format(new Date(parseMonthString(month).y, 0, 1));
  } else {
    label = monthFormatter.format(new Date(y, m - 1, 1));
  }

  const canDrillUp = coarserView(view, views) !== null;
  const configured = (slotProps?.heading ?? {}) as Record<string, unknown>;
  const configuredOnClick = configured.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;

  return renderSlot(
    slots?.heading,
    canDrillUp ? 'button' : 'h2',
    {
      type: canDrillUp ? 'button' : undefined,
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__heading',
        configured.className as string | undefined,
        className,
      ),
      onClick: canDrillUp
        ? composeClickHandlers(
            configuredOnClick,
            composeClickHandlers(
              onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
              () => drillUp(),
            ),
          )
        : onClick,
      'aria-label': canDrillUp ? `Switch view from ${view}` : undefined,
    },
    children ?? label,
  );
}
