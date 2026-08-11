import type { CalendarAnimationClassNames, MonthSlideDirection, ViewTransition } from '../types';

const DEFAULT_ANIMATION_CLASS_NAMES: Required<CalendarAnimationClassNames> = {
  up: 'uikit-cal__grid--up',
  down: 'uikit-cal__grid--down',
  enlarge: 'uikit-cal__grid--enlarge',
  reduce: 'uikit-cal__grid--reduce',
};

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

  const resolve = (key: keyof CalendarAnimationClassNames) => {
    if (custom?.[key]) {
      return custom[key];
    }
    if (disableDefaultStyles) {
      return undefined;
    }
    return DEFAULT_ANIMATION_CLASS_NAMES[key];
  };

  return [
    monthSlideDirection === 'up' && resolve('up'),
    monthSlideDirection === 'down' && resolve('down'),
    viewTransition === 'enlarge' && resolve('enlarge'),
    viewTransition === 'reduce' && resolve('reduce'),
  ];
}
