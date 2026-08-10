import type { CalendarWeekDaysProps } from '../types';
import { useCalendarContext } from './calendar-context';

function getWeekDays(formatter: Intl.DateTimeFormat, weekStartsOn: number): string[] {
  const sunday = new Date(2026, 7, 2);
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2026, 7, sunday.getDate() + ((weekStartsOn + index) % 7))),
  );
}

export function CalendarWeekDays({ children, ...props }: CalendarWeekDaysProps) {
  const { weekdayFormatter, weekStartsOn } = useCalendarContext();
  return (
    <div role="row" {...props}>
      {children ??
        getWeekDays(weekdayFormatter, weekStartsOn).map((label, index) => (
          <div role="columnheader" key={index}>
            {label}
          </div>
        ))}
    </div>
  );
}
