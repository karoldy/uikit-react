import type { CalendarGridProps } from '../types';
import { resolveViewTransitionClassNames } from '../utils/animation-classes';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

export function CalendarGrid({ className, children, ...props }: CalendarGridProps) {
  const { slots, slotProps, disableDefaultStyles, animated, animationClassNames, viewTransition } =
    useCalendarContext();
  const configured = (slotProps?.grid ?? {}) as Record<string, unknown>;

  return renderSlot(
    slots?.grid,
    'div',
    {
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__grid',
        ...resolveViewTransitionClassNames(
          animated,
          disableDefaultStyles,
          animationClassNames,
          viewTransition,
        ),
        configured.className as string | undefined,
        className,
      ),
    },
    children,
  );
}
