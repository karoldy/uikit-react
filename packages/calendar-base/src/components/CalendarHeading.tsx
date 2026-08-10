import type { CalendarHeadingProps } from '../types';
import { parseDateString, startOfMonth } from '../utils/date-string';
import { useCalendarContext } from './calendar-context';

export function CalendarHeading(props: CalendarHeadingProps) {
  const { month, monthFormatter } = useCalendarContext();
  const { y, m } = parseDateString(startOfMonth(month));
  const label = monthFormatter.format(new Date(y, m - 1, 1));

  return <h2 {...props}>{props.children ?? label}</h2>;
}
