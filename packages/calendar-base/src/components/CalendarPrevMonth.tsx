import type { MouseEvent } from 'react';
import type { CalendarNavButtonProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { ChevronLeftIcon } from './icons';
import { renderSlot } from './render-slot';

export function CalendarPrevMonth({
  children,
  onClick,
  className,
  ...props
}: CalendarNavButtonProps) {
  const { goToPrev, view, slots, slotProps, disableDefaultStyles } = useCalendarContext();
  const configured = (slotProps?.prevMonth ?? {}) as Record<string, unknown>;
  const configuredOnClick = configured.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const ariaLabel =
    view === 'year' ? 'Previous years' : view === 'month' ? 'Previous year' : 'Previous month';

  return renderSlot(
    slots?.prevMonth,
    'button',
    {
      type: 'button',
      'aria-label': ariaLabel,
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__nav',
        configured.className as string | undefined,
        className,
      ),
      onClick: composeClickHandlers(
        configuredOnClick,
        composeClickHandlers(
          onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
          () => goToPrev(),
        ),
      ),
    },
    children ?? <ChevronLeftIcon />,
  );
}
