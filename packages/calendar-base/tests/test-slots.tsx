import type {
  CalendarDaySlotProps,
  CalendarHeadingSlotProps,
  CalendarMonthSlotProps,
  CalendarNavSlotProps,
  CalendarSlots,
  CalendarYearSlotProps,
} from '../src';

/** Test-only slots: map explicit `label` → `aria-label` so RTL queries stay stable. */
export function TestDay({
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

export function TestPrevMonth({ label, view: _view, children, ...props }: CalendarNavSlotProps) {
  return (
    <button type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

export function TestNextMonth({ label, view: _view, children, ...props }: CalendarNavSlotProps) {
  return (
    <button type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

export function TestHeading({
  label,
  view: _view,
  drillable,
  children,
  ...props
}: CalendarHeadingSlotProps) {
  if (drillable) {
    return (
      <button type="button" aria-label={`Switch view from ${_view}`} {...props}>
        {children ?? label}
      </button>
    );
  }
  return <h2 {...props}>{children ?? label}</h2>;
}

export function TestYear({
  label,
  year: _year,
  selected,
  children,
  ...props
}: CalendarYearSlotProps) {
  return (
    <button type="button" aria-pressed={selected || undefined} {...props}>
      {children ?? label}
    </button>
  );
}

export function TestMonth({
  label,
  month: _month,
  monthValue: _monthValue,
  selected,
  children,
  ...props
}: CalendarMonthSlotProps) {
  return (
    <button type="button" aria-pressed={selected || undefined} {...props}>
      {children ?? label}
    </button>
  );
}

export const testSlots: CalendarSlots = {
  day: TestDay,
  prevMonth: TestPrevMonth,
  nextMonth: TestNextMonth,
  heading: TestHeading,
  year: TestYear,
  month: TestMonth,
};
