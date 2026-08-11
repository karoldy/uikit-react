import { createContext, useContext } from 'react';
import type { CalendarSlotProps, CalendarSlots, UseCalendarReturn } from '../types';

export interface CalendarContextValue extends UseCalendarReturn {
  slots?: CalendarSlots;
  slotProps?: CalendarSlotProps;
  disableDefaultStyles: boolean;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendarContext(): CalendarContextValue {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('Calendar compound components must be used within <Calendar.Root>');
  }
  return context;
}
