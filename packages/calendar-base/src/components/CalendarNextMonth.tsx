import type { MouseEvent } from 'react';
import type { CalendarNavButtonProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { composeClickHandlers } from './compose-click-handlers';
import { ChevronRightIcon } from './icons';
import { renderSlot } from './render-slot';

export function CalendarNextMonth({
  children,
  onClick,
  className,
  ...props
}: CalendarNavButtonProps) {
  const { goToNext, view, slots, slotProps, disableDefaultStyles } = useCalendarContext();
  const configured = (slotProps?.nextMonth ?? {}) as Record<string, unknown>;
  const configuredOnClick = configured.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const label = view === 'year' ? 'Next years' : view === 'month' ? 'Next year' : 'Next month';
  const NextSlot = slots?.nextMonth;
  const mergedProps: Record<string, unknown> = {
    type: 'button',
    ...props,
    ...configured,
    className: cx(
      !disableDefaultStyles && 'uikit-cal__nav',
      configured.className as string | undefined,
      className,
    ),
    onClick: composeClickHandlers(
      configuredOnClick,
      composeClickHandlers(onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined, () =>
        goToNext(),
      ),
    ),
  };

  if (NextSlot && typeof NextSlot !== 'string') {
    mergedProps.label = label;
    mergedProps.view = view;
  }

  return renderSlot(NextSlot, 'button', mergedProps, children ?? <ChevronRightIcon />);
}
