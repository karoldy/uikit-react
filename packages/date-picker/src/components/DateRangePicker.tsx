import { Calendar } from '@uikit-react/calendar-base';
import { Popover } from '@uikit-react/popover';
import { mergeCalendarSlots } from '../calendar-a11y-slots';
import { useDateRangePicker } from '../hooks/use-date-range-picker';
import type { DateRangePickerProps } from '../types';

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect,
  numberOfMonths = 1,
  min,
  max,
  isDateDisabled,
  dayOf,
  weekStartsOn,
  locale,
  weekdayFormat,
  showOutsideDays,
  views,
  defaultView,
  view,
  onViewChange,
  animated,
  animationClassNames,
  animationDuration,
  asChild = false,
  children,
  placeholder = 'Select date range',
  separator = ' – ',
  calendarSlots,
  calendarSlotProps,
  slotProps,
  placement,
  strategy,
  offset,
  overflowPadding,
  portal,
  dismissible,
  closeOnEsc,
  arrow,
  constrainViewport,
  minWidth,
  minHeight,
}: DateRangePickerProps) {
  const rangePicker = useDateRangePicker({
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect,
    numberOfMonths,
  });
  const calendarProps = rangePicker.getCalendarProps();
  const label =
    rangePicker.value === null
      ? null
      : `${rangePicker.value.start}${separator}${rangePicker.value.end ?? '…'}`;

  return (
    <Popover.Root
      open={rangePicker.open}
      onOpenChange={rangePicker.setOpen}
      placement={placement}
      strategy={strategy}
      offset={offset}
      overflowPadding={overflowPadding}
      portal={portal}
      dismissible={dismissible}
      closeOnEsc={closeOnEsc}
      arrow={arrow}
      constrainViewport={constrainViewport}
      minWidth={minWidth}
      minHeight={minHeight}
    >
      <Popover.Trigger asChild={asChild} {...slotProps?.trigger}>
        {children ?? label ?? placeholder}
      </Popover.Trigger>
      <Popover.Content {...slotProps?.content}>
        <Calendar
          {...calendarProps}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          dayOf={dayOf}
          weekStartsOn={weekStartsOn}
          locale={locale}
          weekdayFormat={weekdayFormat}
          showOutsideDays={showOutsideDays}
          views={views}
          defaultView={defaultView}
          view={view}
          onViewChange={onViewChange}
          animated={animated}
          animationClassNames={animationClassNames}
          animationDuration={animationDuration}
          slots={mergeCalendarSlots(calendarSlots)}
          slotProps={calendarSlotProps}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

/** Alias of {@link DateRangePicker}. */
export const RangePicker = DateRangePicker;
