import { describe, expect, it } from 'vitest';
import { sight } from '../src/utils/sight';

describe('sight', () => {
  it('returns fixed start items and visible center items', () => {
    type Item = { id: number; position?: number };

    const items: Item[] = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];

    const result = sight(
      (item: Item, position) => {
        item.position = position;
        return 50;
      },
      { client: 120, scroll: 200, position: 50, exceed: 0 },
      {
        start: [{ id: -1, position: 0 }],
        center: items,
        end: [],
      },
    );

    expect(result.start).toHaveLength(1);
    expect(result.start[0]?.position).toBe(0);
    expect(result.center.map((item) => item.id)).toEqual([0, 1, 2]);
  });

  it('returns empty buckets when scroll area is zero', () => {
    const result = sight(
      (item) => item.size,
      { client: 100, scroll: 0, position: 0 },
      { center: [{ size: 10 }] },
    );

    expect(result).toEqual({ start: [], center: [], end: [] });
  });
});
