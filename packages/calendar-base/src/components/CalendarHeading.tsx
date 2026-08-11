import type { MouseEvent } from 'react';
import type { CalendarHeadingProps } from '../types';
import { cx } from '../utils/cx';
import { parseDateString, parseMonthString, startOfMonth } from '../utils/date-string';
import { coarserView } from '../utils/views';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { renderSlot } from './render-slot';

export function CalendarHeading({
  className,
  children,
  onClick,
  month: monthProp,
  drillable,
  ...props
}: CalendarHeadingProps) {
  const {
    month: contextMonth,
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

  const month = monthProp ?? contextMonth;
  const { y, m } = parseDateString(startOfMonth(month));
  let label: string;
  if (view === 'year' && monthProp === undefined) {
    label = `${yearFormatter.format(new Date(yearRangeStart, 0, 1))} – ${yearFormatter.format(
      new Date(yearRangeStart + 11, 0, 1),
    )}`;
  } else if (view === 'month' && monthProp === undefined) {
    label = yearFormatter.format(new Date(parseMonthString(month).y, 0, 1));
  } else {
    label = monthFormatter.format(new Date(y, m - 1, 1));
  }

  const canDrillUp = drillable ?? (monthProp === undefined && coarserView(view, views) !== null);
  const configured = (slotProps?.heading ?? {}) as Record<string, unknown>;
  const configuredOnClick = configured.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const HeadingSlot = slots?.heading;
  const fallback = canDrillUp ? 'button' : 'h2';
  const mergedProps: Record<string, unknown> = {
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
  };

  if (HeadingSlot && typeof HeadingSlot !== 'string') {
    mergedProps.label = label;
    mergedProps.view = view;
    mergedProps.drillable = canDrillUp;
  } else if (mergedProps.type === undefined) {
    delete mergedProps.type;
  }

  return renderSlot(HeadingSlot, fallback, mergedProps, children ?? label);
}
