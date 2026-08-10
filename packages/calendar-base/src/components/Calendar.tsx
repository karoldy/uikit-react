import type { ElementType } from 'react';
import type { CalendarProps } from '../types';
import { CalendarDay } from './CalendarDay';
import { CalendarDays } from './CalendarDays';
import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarHeading } from './CalendarHeading';
import { CalendarNextMonth } from './CalendarNextMonth';
import { CalendarPrevMonth } from './CalendarPrevMonth';
import { CalendarRoot } from './CalendarRoot';
import { CalendarWeekDays } from './CalendarWeekDays';

function CalendarDefault<TDay extends ElementType = 'button'>(props: CalendarProps<TDay>) {
  return (
    <CalendarRoot {...props}>
      <CalendarHeader>
        <CalendarPrevMonth />
        <CalendarHeading />
        <CalendarNextMonth />
      </CalendarHeader>
      <CalendarGrid>
        <CalendarWeekDays />
        <CalendarDays />
      </CalendarGrid>
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
});
