import type { CalendarWeekDaysProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

function getWeekDays(formatter: Intl.DateTimeFormat, weekStartsOn: number): string[] {
  const sunday = new Date(2026, 7, 2);
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2026, 7, sunday.getDate() + ((weekStartsOn + index) % 7))),
  );
}

export function CalendarWeekDays({ className, children, ...props }: CalendarWeekDaysProps) {
  const { weekdayFormatter, weekStartsOn, slots, slotProps, disableDefaultStyles } =
    useCalendarContext();
  const configured = (slotProps?.weekDays ?? {}) as Record<string, unknown>;

  return renderSlot(
    slots?.weekDays,
    'div',
    {
      role: 'row',
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__weekdays',
        configured.className as string | undefined,
        className,
      ),
    },
    children ??
      getWeekDays(weekdayFormatter, weekStartsOn).map((label, index) => (
        <div
          role="columnheader"
          key={index}
          className={disableDefaultStyles ? undefined : 'uikit-cal__weekday'}
        >
          {label}
        </div>
      )),
  );
}
