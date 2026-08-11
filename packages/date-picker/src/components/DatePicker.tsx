import { Calendar } from '@uikit-react/calendar-base';
import { Popover } from '@uikit-react/popover';
import { mergeCalendarSlots } from '../calendar-a11y-slots';
import { useDatePicker } from '../hooks/use-date-picker';
import type { DatePickerProps } from '../types';

export function DatePicker({
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
  min,
  max,
  isDateDisabled,
  dayOf,
  weekStartsOn,
  locale,
  showOutsideDays,
  asChild = false,
  children,
  placeholder = 'Select date',
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
}: DatePickerProps) {
  const datePicker = useDatePicker({
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
  });
  const calendarProps = datePicker.getCalendarProps();

  return (
    <Popover.Root
      open={datePicker.open}
      onOpenChange={datePicker.setOpen}
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
        {children ?? datePicker.value ?? placeholder}
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
          showOutsideDays={showOutsideDays}
          slots={mergeCalendarSlots(calendarSlots)}
          slotProps={calendarSlotProps}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
