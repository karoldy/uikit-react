import type { MouseEvent } from 'react';
import type { CalendarNavButtonProps } from '../types';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';

export function CalendarPrevMonth({
  children = 'Previous month',
  onClick,
  ...props
}: CalendarNavButtonProps) {
  const { goToPrevMonth } = useCalendarContext();
  return (
    <button
      type="button"
      aria-label="Previous month"
      {...props}
      onClick={composeClickHandlers(
        onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
        goToPrevMonth,
      )}
    >
      {children}
    </button>
  );
}
