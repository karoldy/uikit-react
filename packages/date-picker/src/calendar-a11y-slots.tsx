import type {
  CalendarDaySlotProps,
  CalendarHeadingSlotProps,
  CalendarNavSlotProps,
  CalendarSlots,
} from '@uikit-react/calendar-base';

function AccessibleDay({
  label,
  selected,
  today,
  outside: _outside,
  date: _date,
  rangeStart: _rangeStart,
  rangeEnd: _rangeEnd,
  inRange: _inRange,
  preview: _preview,
  children,
  ...props
}: CalendarDaySlotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected || undefined}
      aria-current={today ? 'date' : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

function AccessiblePrev({ label, view: _view, children, ...props }: CalendarNavSlotProps) {
  return (
    <button type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

function AccessibleNext({ label, view: _view, children, ...props }: CalendarNavSlotProps) {
  return (
    <button type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

function AccessibleHeading({
  label,
  view,
  drillable,
  children,
  ...props
}: CalendarHeadingSlotProps) {
  if (drillable) {
    return (
      <button type="button" aria-label={`Switch view from ${view}`} {...props}>
        {children ?? label}
      </button>
    );
  }
  return <h2 {...props}>{children ?? label}</h2>;
}

/** Default Calendar slots so DatePicker stays usable without callers wiring ARIA. */
export const datePickerCalendarSlots: CalendarSlots = {
  day: AccessibleDay,
  prevMonth: AccessiblePrev,
  nextMonth: AccessibleNext,
  heading: AccessibleHeading,
};

export function mergeCalendarSlots(slots?: CalendarSlots): CalendarSlots {
  return { ...datePickerCalendarSlots, ...slots };
}
