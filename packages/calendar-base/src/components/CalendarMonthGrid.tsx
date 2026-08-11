import { createElement, type MouseEvent } from 'react';
import type { CalendarMonthGridProps } from '../types';
import { resolveAnimationClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { monthStringFromParts, parseMonthString } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { renderSlot } from './render-slot';

export function CalendarMonthGrid({ className, children, ...props }: CalendarMonthGridProps) {
  const {
    month,
    year,
    monthOnlyFormatter,
    selectMonth,
    slots,
    slotProps,
    disableDefaultStyles,
    animated,
    animationClassNames,
    monthSlideDirection,
    viewTransition,
  } = useCalendarContext();
  const configured = (slotProps?.monthGrid ?? {}) as Record<string, unknown>;
  const monthConfigured = (slotProps?.month ?? {}) as Record<string, unknown>;
  const currentMonth = parseMonthString(month).m;
  const MonthSlot = slots?.month ?? 'button';

  return renderSlot(
    slots?.monthGrid,
    'div',
    {
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__month-grid',
        ...resolveAnimationClassNames(
          animated,
          disableDefaultStyles,
          animationClassNames,
          monthSlideDirection,
          viewTransition,
        ),
        configured.className as string | undefined,
        className,
      ),
    },
    children ??
      Array.from({ length: 12 }, (_, index) => {
        const m = index + 1;
        const selected = m === currentMonth;
        const label = monthOnlyFormatter.format(new Date(year, index, 1));
        const monthValue = monthStringFromParts(year, m);
        const monthOnClick = monthConfigured.onClick as
          ((event: MouseEvent<HTMLElement>) => void) | undefined;
        const mergedProps: Record<string, unknown> = {
          ...monthConfigured,
          type: MonthSlot === 'button' ? 'button' : undefined,
          className: cx(
            !disableDefaultStyles && 'uikit-cal__month',
            !disableDefaultStyles && selected && 'uikit-cal__month--selected',
            monthConfigured.className as string | undefined,
          ),
          onClick: composeClickHandlers(monthOnClick, () => selectMonth(monthValue)),
        };

        if (typeof MonthSlot !== 'string') {
          mergedProps.month = m;
          mergedProps.monthValue = monthValue;
          mergedProps.label = label;
          mergedProps.selected = selected;
        } else if (mergedProps.type === undefined) {
          delete mergedProps.type;
        }

        return createElement(MonthSlot, { key: m, ...mergedProps }, label);
      }),
  );
}
