import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildCalendarMatrix } from '../utils/calendar-matrix';
import {
  calendarValueToDateString,
  isCalendarDateRange,
  isDateInRange,
  isRangeEnd as isRangeEndOf,
  isRangeStart as isRangeStartOf,
  normalizeDateRange,
  resolveHighlightedRange,
} from '../utils/date-range';
import {
  addMonths,
  addYears,
  getTodayString,
  getYear,
  monthStringFromParts,
  parseMonthString,
  toMonthString,
  compareDateString,
  type DateString,
  type MonthString,
} from '../utils/date-string';
import { buildVisibleMonths } from '../utils/months';
import {
  finerView,
  isFinerView,
  normalizeViews,
  resolveInitialView,
  coarserView,
} from '../utils/views';
import type {
  CalendarDateRange,
  CalendarDayOfResult,
  CalendarValue,
  CalendarView,
  MonthSlideDirection,
  UseCalendarOptions,
  UseCalendarReturn,
  ViewTransition,
} from '../types';
import { getCalendarDayOfInfo } from '../utils/day-of';

const YEAR_PAGE_SIZE = 12;

function toRangeValue(value: CalendarValue): CalendarDateRange | null {
  if (isCalendarDateRange(value)) {
    return value;
  }
  return null;
}

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
    selectionMode = 'single',
    value: controlledValue,
    defaultValue = null,
    onChange,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    view: controlledView,
    defaultView,
    onViewChange,
    views: viewsOption,
    min,
    max,
    isDateDisabled,
    dayOf,
    weekStartsOn = 1,
    locale = 'en-US',
    weekdayFormat = 'short',
    animated = true,
    animationClassNames,
    animationDuration = 500,
    numberOfMonths: numberOfMonthsOption = 1,
    showOutsideDays = true,
  } = options;

  const numberOfMonths = Math.max(1, Math.floor(numberOfMonthsOption) || 1);

  const views = useMemo(() => normalizeViews(viewsOption), [viewsOption]);
  const [uncontrolledValue, setUncontrolledValue] = useState<CalendarValue>(defaultValue);
  const initialMonth =
    defaultMonth ??
    toMonthString(calendarValueToDateString(controlledValue ?? defaultValue) ?? getTodayString());
  const [uncontrolledMonth, setUncontrolledMonth] = useState<MonthString>(initialMonth);
  const [uncontrolledView, setUncontrolledView] = useState<CalendarView>(() =>
    resolveInitialView(views, defaultView),
  );
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const y = getYear(initialMonth);
    return y - (y % YEAR_PAGE_SIZE);
  });
  const [monthSlideDirection, setMonthSlideDirection] = useState<MonthSlideDirection>(null);
  const [viewTransition, setViewTransition] = useState<ViewTransition>(null);
  const [hoveredDate, setHoveredDateState] = useState<DateString | null>(null);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const month = controlledMonth ?? uncontrolledMonth;
  const view =
    controlledView !== undefined && views.includes(controlledView)
      ? controlledView
      : views.includes(uncontrolledView)
        ? uncontrolledView
        : resolveInitialView(views, defaultView);

  const rangeValue = selectionMode === 'range' ? toRangeValue(value) : null;
  const isSelectingEnd =
    selectionMode === 'range' && rangeValue !== null && rangeValue.end === null;
  const isPreviewing = isSelectingEnd && hoveredDate !== null;
  const highlightedRange = useMemo(
    () => (selectionMode === 'range' ? resolveHighlightedRange(rangeValue, hoveredDate) : null),
    [hoveredDate, rangeValue, selectionMode],
  );

  const prevMonthRef = useRef(month);
  const prevViewRef = useRef(view);

  useEffect(() => {
    if (!animated) {
      prevMonthRef.current = month;
      setMonthSlideDirection(null);
      return;
    }
    if (prevMonthRef.current !== month) {
      setMonthSlideDirection(prevMonthRef.current < month ? 'up' : 'down');
      prevMonthRef.current = month;
    }
  }, [month, animated]);

  useEffect(() => {
    if (!animated) {
      prevViewRef.current = view;
      setViewTransition(null);
      return;
    }
    if (prevViewRef.current !== view) {
      setViewTransition(isFinerView(view, prevViewRef.current) ? 'enlarge' : 'reduce');
      prevViewRef.current = view;
    }
  }, [view, animated]);

  useEffect(() => {
    if (!monthSlideDirection && !viewTransition) {
      return;
    }
    const id = window.setTimeout(() => {
      setMonthSlideDirection(null);
      setViewTransition(null);
    }, animationDuration);
    return () => window.clearTimeout(id);
  }, [monthSlideDirection, viewTransition, month, view, animationDuration]);

  const setValue = useCallback(
    (next: CalendarValue) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [controlledValue, onChange],
  );

  const setMonth = useCallback(
    (nextMonth: MonthString) => {
      if (controlledMonth === undefined) {
        setUncontrolledMonth(nextMonth);
      }
      onMonthChange?.(nextMonth);
      const y = getYear(nextMonth);
      setYearRangeStart(y - (y % YEAR_PAGE_SIZE));
    },
    [controlledMonth, onMonthChange],
  );

  const setView = useCallback(
    (nextView: CalendarView) => {
      if (!views.includes(nextView)) {
        return;
      }
      if (controlledView === undefined) {
        setUncontrolledView(nextView);
      }
      onViewChange?.(nextView);
    },
    [controlledView, onViewChange, views],
  );

  const today = getTodayString();
  const isToday = useCallback((date: DateString) => date === today, [today]);

  const getDayOf = useCallback(
    (date: DateString, inCurrentMonth = true): CalendarDayOfResult => {
      if (!dayOf) {
        return {};
      }
      return (
        dayOf(
          getCalendarDayOfInfo(date, {
            inCurrentMonth,
            today,
          }),
        ) ?? {}
      );
    },
    [dayOf, today],
  );

  const isDisabled = useCallback(
    (date: DateString, inCurrentMonth = true) =>
      (min !== undefined && compareDateString(date, min) < 0) ||
      (max !== undefined && compareDateString(date, max) > 0) ||
      Boolean(isDateDisabled?.(date)) ||
      Boolean(getDayOf(date, inCurrentMonth).disabled),
    [getDayOf, isDateDisabled, max, min],
  );

  const isRangeStart = useCallback(
    (date: DateString) => isRangeStartOf(highlightedRange, date),
    [highlightedRange],
  );
  const isRangeEnd = useCallback(
    (date: DateString) => isRangeEndOf(highlightedRange, date),
    [highlightedRange],
  );
  const isInRange = useCallback(
    (date: DateString) => isDateInRange(highlightedRange, date),
    [highlightedRange],
  );
  const isSelected = useCallback(
    (date: DateString) => {
      if (selectionMode === 'range') {
        return isRangeStart(date) || isRangeEnd(date);
      }
      return value === date;
    },
    [isRangeEnd, isRangeStart, selectionMode, value],
  );

  const selectDate = useCallback(
    (date: DateString) => {
      if (isDisabled(date)) {
        return;
      }

      if (selectionMode === 'range') {
        const current = toRangeValue(value);
        if (!current || current.end !== null) {
          setHoveredDateState(null);
          setValue({ start: date, end: null });
          return;
        }
        setHoveredDateState(null);
        setValue(normalizeDateRange({ start: current.start, end: date }));
        return;
      }

      setValue(date);
    },
    [isDisabled, selectionMode, setValue, value],
  );

  const setHoveredDate = useCallback(
    (date: DateString | null) => {
      if (date !== null && !isSelectingEnd) {
        return;
      }
      setHoveredDateState(date);
    },
    [isSelectingEnd],
  );

  const selectMonth = useCallback(
    (nextMonth: MonthString) => {
      setMonth(nextMonth);
      const next = finerView('month', views);
      if (next) {
        setView(next);
      }
    },
    [setMonth, setView, views],
  );

  const selectYear = useCallback(
    (year: number) => {
      const { m } = parseMonthString(month);
      setMonth(monthStringFromParts(year, m));
      const next = finerView('year', views);
      if (next) {
        setView(next);
      }
    },
    [month, setMonth, setView, views],
  );

  const goToPrevMonth = useCallback(() => setMonth(addMonths(month, -1)), [month, setMonth]);
  const goToNextMonth = useCallback(() => setMonth(addMonths(month, 1)), [month, setMonth]);

  const goToPrev = useCallback(() => {
    if (view === 'day') {
      goToPrevMonth();
      return;
    }
    if (view === 'month') {
      setMonth(addYears(month, -1));
      return;
    }
    setYearRangeStart((start) => start - YEAR_PAGE_SIZE);
  }, [goToPrevMonth, month, setMonth, view]);

  const goToNext = useCallback(() => {
    if (view === 'day') {
      goToNextMonth();
      return;
    }
    if (view === 'month') {
      setMonth(addYears(month, 1));
      return;
    }
    setYearRangeStart((start) => start + YEAR_PAGE_SIZE);
  }, [goToNextMonth, month, setMonth, view]);

  const drillUp = useCallback(() => {
    const next = coarserView(view, views);
    if (next) {
      setView(next);
    }
  }, [setView, view, views]);

  const months = useMemo(() => buildVisibleMonths(month, numberOfMonths), [month, numberOfMonths]);
  const panels = useMemo(
    () =>
      months.map((panelMonth) => ({
        month: panelMonth,
        cells: buildCalendarMatrix(panelMonth, weekStartsOn),
      })),
    [months, weekStartsOn],
  );
  const cells = panels[0]?.cells ?? buildCalendarMatrix(month, weekStartsOn);
  const year = getYear(month);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: weekdayFormat }),
    [locale, weekdayFormat],
  );
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );
  const yearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric' }),
    [locale],
  );
  const monthOnlyFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short' }),
    [locale],
  );

  return {
    selectionMode,
    value,
    setValue,
    month,
    setMonth,
    view,
    setView,
    views,
    year,
    yearRangeStart,
    numberOfMonths,
    showOutsideDays,
    months,
    panels,
    cells,
    weekStartsOn,
    locale,
    weekdayFormat,
    monthFormatter,
    weekdayFormatter,
    dayFormatter,
    yearFormatter,
    monthOnlyFormatter,
    highlightedRange,
    isPreviewing,
    hoveredDate,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    isDisabled,
    isToday,
    getDayOf,
    selectDate,
    setHoveredDate,
    selectMonth,
    selectYear,
    goToPrev,
    goToNext,
    goToPrevMonth,
    goToNextMonth,
    drillUp,
    monthSlideDirection: animated ? monthSlideDirection : null,
    viewTransition: animated ? viewTransition : null,
    animated,
    animationClassNames,
    animationDuration,
  };
}
