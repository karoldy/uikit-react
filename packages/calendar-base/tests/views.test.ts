import { describe, expect, it } from 'vitest';
import {
  coarserView,
  finerView,
  isFinerView,
  normalizeViews,
  resolveInitialView,
} from '../src/utils/views';

describe('normalizeViews', () => {
  it('defaults to year, month, day in rank order', () => {
    expect(normalizeViews()).toEqual(['year', 'month', 'day']);
    expect(normalizeViews([])).toEqual(['year', 'month', 'day']);
  });

  it('dedupes and sorts by coarseness', () => {
    expect(normalizeViews(['day', 'year', 'day', 'month'])).toEqual(['year', 'month', 'day']);
  });
});

describe('resolveInitialView', () => {
  it('uses preferred when allowed', () => {
    expect(resolveInitialView(['year', 'month', 'day'], 'month')).toBe('month');
  });

  it('prefers day when preferred is missing', () => {
    expect(resolveInitialView(['year', 'month', 'day'], 'year')).toBe('year');
    expect(resolveInitialView(['year', 'month', 'day'])).toBe('day');
  });

  it('falls back to finest allowed when day is excluded', () => {
    expect(resolveInitialView(['year', 'month'])).toBe('month');
    expect(resolveInitialView(['year'])).toBe('year');
  });

  it('ignores preferred views outside the whitelist', () => {
    expect(resolveInitialView(['month', 'day'], 'year')).toBe('day');
  });
});

describe('coarserView', () => {
  it('returns the next coarser allowed view', () => {
    expect(coarserView('day', ['year', 'month', 'day'])).toBe('month');
    expect(coarserView('month', ['year', 'month', 'day'])).toBe('year');
  });

  it('returns null at the coarsest allowed view', () => {
    expect(coarserView('year', ['year', 'month', 'day'])).toBeNull();
    expect(coarserView('month', ['month', 'day'])).toBeNull();
  });
});

describe('finerView', () => {
  it('returns the next finer allowed view', () => {
    expect(finerView('year', ['year', 'month', 'day'])).toBe('month');
    expect(finerView('month', ['year', 'month', 'day'])).toBe('day');
  });

  it('returns null at the finest allowed view', () => {
    expect(finerView('day', ['year', 'month', 'day'])).toBeNull();
    expect(finerView('year', ['year'])).toBeNull();
  });

  it('skips disallowed intermediate views', () => {
    expect(finerView('year', ['year', 'day'])).toBe('day');
  });
});

describe('isFinerView', () => {
  it('compares view ranks', () => {
    expect(isFinerView('day', 'month')).toBe(true);
    expect(isFinerView('month', 'year')).toBe(true);
    expect(isFinerView('year', 'day')).toBe(false);
    expect(isFinerView('month', 'month')).toBe(false);
  });
});
