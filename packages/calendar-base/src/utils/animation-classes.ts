import type { CalendarAnimationClassNames, MonthSlideDirection, ViewTransition } from '../types';

const DEFAULT_SLIDE_CLASS_NAMES = {
  up: 'uikit-cal__days--up',
  down: 'uikit-cal__days--down',
} as const;

const DEFAULT_VIEW_CLASS_NAMES = {
  enlarge: 'uikit-cal__grid--enlarge',
  reduce: 'uikit-cal__grid--reduce',
} as const;

/** Year / month view containers still use the shared slide keyframes. */
const DEFAULT_PANEL_SLIDE_CLASS_NAMES = {
  up: 'uikit-cal__grid--up',
  down: 'uikit-cal__grid--down',
} as const;

function resolveKey(
  key: keyof CalendarAnimationClassNames,
  disableDefaultStyles: boolean,
  custom: CalendarAnimationClassNames | undefined,
  fallback: string,
): string | undefined {
  if (custom?.[key]) {
    return custom[key];
  }
  if (disableDefaultStyles) {
    return undefined;
  }
  return fallback;
}

/** Month navigation slide classes for `CalendarDays`. */
export function resolveMonthSlideClassNames(
  animated: boolean,
  disableDefaultStyles: boolean,
  custom: CalendarAnimationClassNames | undefined,
  monthSlideDirection: MonthSlideDirection,
): Array<string | false | undefined> {
  if (!animated) {
    return [];
  }
  return [
    monthSlideDirection === 'up' &&
      resolveKey('up', disableDefaultStyles, custom, DEFAULT_SLIDE_CLASS_NAMES.up),
    monthSlideDirection === 'down' &&
      resolveKey('down', disableDefaultStyles, custom, DEFAULT_SLIDE_CLASS_NAMES.down),
  ];
}

/** View drill enlarge/reduce classes for `CalendarGrid`. */
export function resolveViewTransitionClassNames(
  animated: boolean,
  disableDefaultStyles: boolean,
  custom: CalendarAnimationClassNames | undefined,
  viewTransition: ViewTransition,
): Array<string | false | undefined> {
  if (!animated) {
    return [];
  }
  return [
    viewTransition === 'enlarge' &&
      resolveKey('enlarge', disableDefaultStyles, custom, DEFAULT_VIEW_CLASS_NAMES.enlarge),
    viewTransition === 'reduce' &&
      resolveKey('reduce', disableDefaultStyles, custom, DEFAULT_VIEW_CLASS_NAMES.reduce),
  ];
}

/**
 * Combined animations for year/month panels (slide + view transition).
 * Day view splits these across `CalendarDays` / `CalendarGrid`.
 */
export function resolveAnimationClassNames(
  animated: boolean,
  disableDefaultStyles: boolean,
  custom: CalendarAnimationClassNames | undefined,
  monthSlideDirection: MonthSlideDirection,
  viewTransition: ViewTransition,
): Array<string | false | undefined> {
  if (!animated) {
    return [];
  }

  return [
    monthSlideDirection === 'up' &&
      resolveKey('up', disableDefaultStyles, custom, DEFAULT_PANEL_SLIDE_CLASS_NAMES.up),
    monthSlideDirection === 'down' &&
      resolveKey('down', disableDefaultStyles, custom, DEFAULT_PANEL_SLIDE_CLASS_NAMES.down),
    ...resolveViewTransitionClassNames(animated, disableDefaultStyles, custom, viewTransition),
  ];
}
