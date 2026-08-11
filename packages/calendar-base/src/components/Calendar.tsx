import type { CalendarProps } from '../types';
import { CalendarDay } from './CalendarDay';
import { CalendarDays } from './CalendarDays';
import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarHeading } from './CalendarHeading';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { CalendarNextMonth } from './CalendarNextMonth';
import { CalendarPanel } from './CalendarPanel';
import { CalendarPanels } from './CalendarPanels';
import { CalendarPrevMonth } from './CalendarPrevMonth';
import { CalendarRoot } from './CalendarRoot';
import { CalendarWeekDays } from './CalendarWeekDays';
import { CalendarYearSelect } from './CalendarYearSelect';
import { useCalendarContext } from './calendar-context';

function CalendarMultiMonthDayView() {
  const { panels } = useCalendarContext();

  return (
    <CalendarPanels>
      {panels.map((panel, index) => (
        <CalendarPanel key={panel.month}>
          <CalendarHeader>
            {index === 0 ? <CalendarPrevMonth /> : <span />}
            <CalendarHeading month={panel.month} drillable={false} />
            {index === panels.length - 1 ? <CalendarNextMonth /> : <span />}
          </CalendarHeader>
          <CalendarGrid>
            <CalendarWeekDays />
            <CalendarDays month={panel.month} />
          </CalendarGrid>
        </CalendarPanel>
      ))}
    </CalendarPanels>
  );
}

function CalendarBody() {
  const { view, numberOfMonths } = useCalendarContext();

  if (view === 'year') {
    return <CalendarYearSelect />;
  }
  if (view === 'month') {
    return <CalendarMonthGrid />;
  }
  if (numberOfMonths > 1) {
    return <CalendarMultiMonthDayView />;
  }

  return (
    <CalendarGrid>
      <CalendarWeekDays />
      <CalendarDays />
    </CalendarGrid>
  );
}

function CalendarChrome() {
  const { view, numberOfMonths } = useCalendarContext();
  const multiMonthDay = view === 'day' && numberOfMonths > 1;

  return (
    <>
      {multiMonthDay ? null : (
        <CalendarHeader>
          <CalendarPrevMonth />
          <CalendarHeading />
          <CalendarNextMonth />
        </CalendarHeader>
      )}
      <CalendarBody />
    </>
  );
}

function CalendarDefault(props: CalendarProps) {
  return (
    <CalendarRoot {...props}>
      <CalendarChrome />
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
  Panels: CalendarPanels,
  Panel: CalendarPanel,
});
