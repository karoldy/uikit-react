import { createElement, type MouseEvent } from 'react';
import type { CalendarYearSelectProps } from '../types';
import { resolveAnimationClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { renderSlot } from './render-slot';

export function CalendarYearSelect({ className, children, ...props }: CalendarYearSelectProps) {
  const {
    year,
    yearRangeStart,
    yearFormatter,
    selectYear,
    slots,
    slotProps,
    disableDefaultStyles,
    animated,
    animationClassNames,
    monthSlideDirection,
    viewTransition,
  } = useCalendarContext();
  const configured = (slotProps?.yearSelect ?? {}) as Record<string, unknown>;
  const yearConfigured = (slotProps?.year ?? {}) as Record<string, unknown>;
  const years = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);
  const YearSlot = slots?.year ?? 'button';

  return renderSlot(
    slots?.yearSelect,
    'div',
    {
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__year-select',
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
      years.map((y) => {
        const selected = y === year;
        const label = yearFormatter.format(new Date(y, 0, 1));
        const yearOnClick = yearConfigured.onClick as
          ((event: MouseEvent<HTMLElement>) => void) | undefined;
        const mergedProps: Record<string, unknown> = {
          ...yearConfigured,
          type: YearSlot === 'button' ? 'button' : undefined,
          className: cx(
            !disableDefaultStyles && 'uikit-cal__year',
            !disableDefaultStyles && selected && 'uikit-cal__year--selected',
            yearConfigured.className as string | undefined,
          ),
          onClick: composeClickHandlers(yearOnClick, () => selectYear(y)),
        };

        if (typeof YearSlot !== 'string') {
          mergedProps.year = y;
          mergedProps.label = label;
          mergedProps.selected = selected;
        } else if (mergedProps.type === undefined) {
          delete mergedProps.type;
        }

        return createElement(YearSlot, { key: y, ...mergedProps }, label);
      }),
  );
}
