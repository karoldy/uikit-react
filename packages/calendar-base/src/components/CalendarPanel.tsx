import type { CalendarPanelProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

export function CalendarPanel({ className, children, ...props }: CalendarPanelProps) {
  const { slots, slotProps, disableDefaultStyles } = useCalendarContext();
  const configured = (slotProps?.panel ?? {}) as Record<string, unknown>;

  return renderSlot(
    slots?.panel,
    'div',
    {
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__panel',
        configured.className as string | undefined,
        className,
      ),
    },
    children,
  );
}
