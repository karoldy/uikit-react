import { describe, expect, it } from 'vitest';
import { normalizeSort } from '../src/sorting/sort-state';

describe('normalizeSort', () => {
  it('返回同一数组引用当每一项都已合法', () => {
    const input = [{ columnKey: 'name', direction: 'asc' as const }];
    expect(normalizeSort(input)).toBe(input);
  });
});
