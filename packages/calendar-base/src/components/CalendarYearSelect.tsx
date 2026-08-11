import type { CalendarYearSelectProps } from '../types';
import { resolveAnimationClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
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
  const years = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  return renderSlot(
    slots?.yearSelect,
    'div',
    {
      role: 'grid',
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
        return (
          <button
            key={y}
            type="button"
            className={cx(
              !disableDefaultStyles && 'uikit-cal__year',
              !disableDefaultStyles && selected && 'uikit-cal__year--selected',
            )}
            aria-pressed={selected || undefined}
            onClick={() => selectYear(y)}
          >
            {label}
          </button>
        );
      }),
  );
}
