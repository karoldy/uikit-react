import type { CalendarProps } from '../types';
import { CalendarDay } from './CalendarDay';
import { CalendarDays } from './CalendarDays';
import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarHeading } from './CalendarHeading';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { CalendarNextMonth } from './CalendarNextMonth';
import { CalendarPrevMonth } from './CalendarPrevMonth';
import { CalendarRoot } from './CalendarRoot';
import { CalendarWeekDays } from './CalendarWeekDays';
import { CalendarYearSelect } from './CalendarYearSelect';
import { useCalendarContext } from './calendar-context';

function CalendarBody() {
  const { view } = useCalendarContext();

  if (view === 'year') {
    return <CalendarYearSelect />;
  }
  if (view === 'month') {
    return <CalendarMonthGrid />;
  }

  return (
    <CalendarGrid>
      <CalendarWeekDays />
      <CalendarDays />
    </CalendarGrid>
  );
}

function CalendarDefault(props: CalendarProps) {
  return (
    <CalendarRoot {...props}>
      <CalendarHeader>
        <CalendarPrevMonth />
        <CalendarHeading />
        <CalendarNextMonth />
      </CalendarHeader>
      <CalendarBody />
    </CalendarRoot>
  );
}

export const Calendar = Object.assign(CalendarDefault, {
  Root: CalendarRoot,
  Header: CalendarHeader,
  PrevMonth: CalendarPrevMonth,
  NextMonth: CalendarNextMonth,
  Heading: CalendarHeading,
  Grid: CalendarGrid,
  WeekDays: CalendarWeekDays,
  Days: CalendarDays,
  Day: CalendarDay,
  YearSelect: CalendarYearSelect,
  MonthGrid: CalendarMonthGrid,
});
