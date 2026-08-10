import type { MouseEvent } from 'react';
import type { CalendarNavButtonProps } from '../types';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';

export function CalendarNextMonth({
  children = 'Next month',
  onClick,
  ...props
}: CalendarNavButtonProps) {
  const { goToNextMonth } = useCalendarContext();
  return (
    <button
      type="button"
      aria-label="Next month"
      {...props}
      onClick={composeClickHandlers(
        onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined,
        goToNextMonth,
      )}
    >
      {children}
    </button>
  );
}
