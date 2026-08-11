import { useCalendar } from '../hooks/use-calendar';
import type { CalendarRootProps } from '../types';
import { cx } from '../utils/cx';
import { CalendarContext } from './calendar-context';
import { renderSlot } from './render-slot';

export function CalendarRoot({
  value,
  defaultValue,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  view,
  defaultView,
  onViewChange,
  views,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale,
  weekdayFormat,
  animated,
  animationClassNames,
  animationDuration,
  slots,
  slotProps,
  disableDefaultStyles = false,
  className,
  children,
  ...props
}: CalendarRootProps) {
  const calendar = useCalendar({
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    view,
    defaultView,
    onViewChange,
    views,
    min,
    max,
    isDateDisabled,
    weekStartsOn,
    locale,
    weekdayFormat,
    animated,
    animationClassNames,
    animationDuration,
  });

  const rootSlotProps = (slotProps?.root ?? {}) as Record<string, unknown>;
  const mergedClassName = cx(
    !disableDefaultStyles && 'uikit-cal',
    rootSlotProps.className as string | undefined,
    className,
  );

  return (
    <CalendarContext.Provider
      value={{
        ...calendar,
        slots,
        slotProps,
        disableDefaultStyles,
      }}
    >
      {renderSlot(
        slots?.root,
        'div',
        {
          ...props,
          ...rootSlotProps,
          className: mergedClassName,
        },
        children,
      )}
    </CalendarContext.Provider>
  );
}
