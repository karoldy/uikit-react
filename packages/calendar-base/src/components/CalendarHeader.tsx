import type { CalendarHeaderProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

export function CalendarHeader({ className, children, ...props }: CalendarHeaderProps) {
  const { slots, slotProps, disableDefaultStyles } = useCalendarContext();
  const configured = (slotProps?.header ?? {}) as Record<string, unknown>;

  return renderSlot(
    slots?.header,
    'div',
    {
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__header',
        configured.className as string | undefined,
        className,
      ),
    },
    children,
  );
}
