import type { ReactNode } from 'react';
import type { CalendarDaysProps } from '../types';
import { cx } from '../utils/cx';
import { useCalendarContext } from './calendar-context';
import { CalendarDay } from './CalendarDay';
import { renderSlot } from './render-slot';

export function CalendarDays({ className, children, ...props }: CalendarDaysProps) {
  const { cells, slots, slotProps, disableDefaultStyles } = useCalendarContext();
  const configured = (slotProps?.days ?? {}) as Record<string, unknown>;
  const rows: ReactNode[] = [];

  for (let row = 0; row < 6; row += 1) {
    rows.push(
      <div role="row" className={disableDefaultStyles ? undefined : 'uikit-cal__row'} key={row}>
        {cells.slice(row * 7, row * 7 + 7).map((cell) => (
          <CalendarDay cell={cell} key={cell.date} />
        ))}
      </div>,
    );
  }

  return renderSlot(
    slots?.days,
    'div',
    {
      role: 'rowgroup',
      ...props,
      ...configured,
      className: cx(
        !disableDefaultStyles && 'uikit-cal__days',
        configured.className as string | undefined,
        className,
      ),
    },
    children ?? rows,
  );
}
