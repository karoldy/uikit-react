import type { MouseEvent } from 'react';
import type { CalendarPanelsProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

export function CalendarPanels({
  className,
  children,
  onMouseLeave,
  ...props
}: CalendarPanelsProps) {
  const { slots, slotProps, disableDefaultStyles, selectionMode, setHoveredDate, numberOfMonths } =
    useCalendarContext();
  const configured = (slotProps?.panels ?? {}) as Record<string, unknown>;
  const configuredOnMouseLeave = configured.onMouseLeave as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;

  return renderSlot(
    slots?.panels,
    'div',
    {
      ...props,
      ...configured,
      onMouseLeave: (event: MouseEvent<HTMLElement>) => {
        configuredOnMouseLeave?.(event);
        onMouseLeave?.(event);
        if (!event.defaultPrevented && selectionMode === 'range' && numberOfMonths > 1) {
          setHoveredDate(null);
        }
      },
      className: cx(
        !disableDefaultStyles && 'uikit-cal__panels',
        configured.className as string | undefined,
        className,
      ),
    },
    children,
  );
}
