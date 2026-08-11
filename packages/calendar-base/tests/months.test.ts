import { describe, expect, it } from 'vitest';
import { buildVisibleMonths } from '../src/utils/months';

describe('buildVisibleMonths', () => {
  it('returns a single month by default count', () => {
    expect(buildVisibleMonths('2026-08', 1)).toEqual(['2026-08']);
  });

  it('returns consecutive months', () => {
    expect(buildVisibleMonths('2026-08', 2)).toEqual(['2026-08', '2026-09']);
    expect(buildVisibleMonths('2026-11', 3)).toEqual(['2026-11', '2026-12', '2027-01']);
  });

  it('clamps count to at least 1', () => {
    expect(buildVisibleMonths('2026-08', 0)).toEqual(['2026-08']);
    expect(buildVisibleMonths('2026-08', -2)).toEqual(['2026-08']);
  });
});
