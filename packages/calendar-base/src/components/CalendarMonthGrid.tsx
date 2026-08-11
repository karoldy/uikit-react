import type { CalendarMonthGridProps } from '../types';
import { resolveAnimationClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { monthStringFromParts, parseMonthString } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';
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
  const currentMonth = parseMonthString(month).m;

  return renderSlot(
    slots?.monthGrid,
    'div',
    {
      role: 'grid',
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
        return (
          <button
            key={m}
            type="button"
            className={cx(
              !disableDefaultStyles && 'uikit-cal__month',
              !disableDefaultStyles && selected && 'uikit-cal__month--selected',
            )}
            aria-pressed={selected || undefined}
            onClick={() => selectMonth(monthStringFromParts(year, m))}
          >
            {label}
          </button>
        );
      }),
  );
}
