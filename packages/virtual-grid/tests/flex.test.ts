import { describe, expect, it } from 'vitest';
import { flex } from '../src/utils/flex';

describe('flex', () => {
  it('distributes remaining width to flexible columns', () => {
    const result = flex((item) => item.value, 300, [
      { flexible: false, value: 100 },
      { flexible: true, value: 50, min: 80, max: 200 },
    ]);

    expect(result).toEqual([100, 200]);
  });

  it('shrinks flexible columns when total exceeds limit', () => {
    const result = flex((item) => item.value, 200, [
      { flexible: false, value: 100 },
      { flexible: true, value: 150, min: 50, max: 200 },
    ]);

    expect(result).toEqual([100, 100]);
  });
});
