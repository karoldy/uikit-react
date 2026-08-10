import type { ElementType } from 'react';
import { useCalendar } from '../hooks/use-calendar';
import type { CalendarRootProps } from '../types';
import { CalendarContext } from './calendar-context';

export function CalendarRoot<TDay extends ElementType = 'button'>({
  value,
  defaultValue,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale,
  slots,
  slotProps,
  children,
  ...props
}: CalendarRootProps<TDay>) {
  const calendar = useCalendar({
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn,
    locale,
  });

  return (
    <CalendarContext.Provider
      value={{
        ...calendar,
        slots: slots as CalendarRootProps<ElementType>['slots'],
        slotProps: slotProps as CalendarRootProps<ElementType>['slotProps'],
      }}
    >
      <div {...props}>{children}</div>
    </CalendarContext.Provider>
  );
}
