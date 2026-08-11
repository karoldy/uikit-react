import type { CalendarView } from '../types';
import { DEFAULT_VIEWS } from '../types';

const VIEW_RANK: Record<CalendarView, number> = {
  year: 0,
  month: 1,
  day: 2,
};

export function normalizeViews(views?: CalendarView[]): CalendarView[] {
  const source = views?.length ? views : DEFAULT_VIEWS;
  const unique = Array.from(new Set(source));
  return unique.sort((a, b) => VIEW_RANK[a] - VIEW_RANK[b]);
}

export function resolveInitialView(
  allowed: CalendarView[],
  preferred?: CalendarView,
): CalendarView {
  if (preferred && allowed.includes(preferred)) {
    return preferred;
  }
  if (allowed.includes('day')) {
    return 'day';
  }
  return allowed[allowed.length - 1]!;
}

/** Next coarser view (toward year), or null if already coarsest allowed. */
export function coarserView(current: CalendarView, allowed: CalendarView[]): CalendarView | null {
  const coarser = allowed.filter((view) => VIEW_RANK[view] < VIEW_RANK[current]);
  return coarser.length ? coarser[coarser.length - 1]! : null;
}

/** Next finer view (toward day), or null if already finest allowed. */
export function finerView(current: CalendarView, allowed: CalendarView[]): CalendarView | null {
  const finer = allowed.filter((view) => VIEW_RANK[view] > VIEW_RANK[current]);
  return finer.length ? finer[0]! : null;
}

export function isFinerView(next: CalendarView, current: CalendarView): boolean {
  return VIEW_RANK[next] > VIEW_RANK[current];
}
