import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildCalendarMatrix } from '../utils/calendar-matrix';
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
import {
  finerView,
  isFinerView,
  normalizeViews,
  resolveInitialView,
  coarserView,
} from '../utils/views';
import type {
  CalendarView,
  MonthSlideDirection,
  UseCalendarOptions,
  UseCalendarReturn,
  ViewTransition,
} from '../types';

const YEAR_PAGE_SIZE = 12;

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
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
    weekStartsOn = 1,
    locale = 'en-US',
    weekdayFormat = 'short',
    animated = true,
    animationClassNames,
    animationDuration = 500,
  } = options;

  const views = useMemo(() => normalizeViews(viewsOption), [viewsOption]);
  const [uncontrolledValue, setUncontrolledValue] = useState<DateString | null>(defaultValue);
  const initialMonth =
    defaultMonth ?? toMonthString(controlledValue ?? defaultValue ?? getTodayString());
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

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const month = controlledMonth ?? uncontrolledMonth;
  const view =
    controlledView !== undefined && views.includes(controlledView)
      ? controlledView
      : views.includes(uncontrolledView)
        ? uncontrolledView
        : resolveInitialView(views, defaultView);

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
    (date: DateString | null) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(date);
      }
      onChange?.(date);
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

  const isSelected = useCallback((date: DateString) => value === date, [value]);
  const isDisabled = useCallback(
    (date: DateString) =>
      (min !== undefined && compareDateString(date, min) < 0) ||
      (max !== undefined && compareDateString(date, max) > 0) ||
      Boolean(isDateDisabled?.(date)),
    [isDateDisabled, max, min],
  );
  const today = getTodayString();
  const isToday = useCallback((date: DateString) => date === today, [today]);
  const selectDate = useCallback(
    (date: DateString) => {
      if (!isDisabled(date)) {
        setValue(date);
      }
    },
    [isDisabled, setValue],
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

  const cells = useMemo(() => buildCalendarMatrix(month, weekStartsOn), [month, weekStartsOn]);
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
    value,
    setValue,
    month,
    setMonth,
    view,
    setView,
    views,
    year,
    yearRangeStart,
    cells,
    weekStartsOn,
    locale,
    weekdayFormat,
    monthFormatter,
    weekdayFormatter,
    dayFormatter,
    yearFormatter,
    monthOnlyFormatter,
    isSelected,
    isDisabled,
    isToday,
    selectDate,
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
