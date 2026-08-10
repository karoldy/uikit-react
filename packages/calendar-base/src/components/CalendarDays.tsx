import type { ReactNode } from 'react';
import type { CalendarDaysProps } from '../types';
import { useCalendarContext } from './calendar-context';
import { CalendarDay } from './CalendarDay';

export function CalendarDays({ children, ...props }: CalendarDaysProps) {
  const { cells } = useCalendarContext();
  const rows: ReactNode[] = [];

  for (let row = 0; row < 6; row += 1) {
    rows.push(
      <div role="row" key={row}>
        {cells.slice(row * 7, row * 7 + 7).map((cell) => (
          <CalendarDay cell={cell} key={cell.date} />
        ))}
      </div>,
    );
  }

  return (
    <div {...props} role="rowgroup">
      {children ?? rows}
    </div>
  );
}
