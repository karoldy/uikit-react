import type { CalendarGridProps } from '../types';

export function CalendarGrid({ children, ...props }: CalendarGridProps) {
  return (
    <div role="grid" {...props}>
      {children}
    </div>
  );
}
