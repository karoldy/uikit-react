import { describe, expect, it } from 'vitest';
import { getVirtualRange } from '../src/utils/virtual-range';

describe('getVirtualRange', () => {
  it('初始可见范围(含 overscan)', () => {
    const range = getVirtualRange({
      viewportHeight: 300,
      scrollTop: 0,
      rowHeight: 30,
      count: 100,
      overscan: 5,
    });
    expect(range.totalHeight).toBe(3000);
    expect(range.start).toBe(0);
    // firstVisible=0, visibleCount=ceil(300/30)+1=11, end=min(100, 11+5)=16
    expect(range.end).toBe(16);
    expect(range.offsetStart).toBe(0);
  });

  it('滚动后范围前移,offsetStart 正确', () => {
    const range = getVirtualRange({
      viewportHeight: 300,
      scrollTop: 600,
      rowHeight: 30,
      count: 100,
      overscan: 5,
    });
    // firstVisible=20, start=max(0,15)=15, end=min(100, 20+11+5)=36
    expect(range.start).toBe(15);
    expect(range.end).toBe(36);
    expect(range.offsetStart).toBe(450);
  });

  it('末尾 clamp', () => {
    const range = getVirtualRange({
      viewportHeight: 300,
      scrollTop: 2900,
      rowHeight: 30,
      count: 100,
      overscan: 5,
    });
    // firstVisible=96, start=91, end=min(100, 96+11+5)=100
    expect(range.start).toBe(91);
    expect(range.end).toBe(100);
  });

  it('空数据安全', () => {
    expect(getVirtualRange({ viewportHeight: 300, scrollTop: 0, rowHeight: 30, count: 0 })).toEqual(
      {
        start: 0,
        end: 0,
        totalHeight: 0,
        offsetStart: 0,
      },
    );
  });

  it('默认 overscan 为 5', () => {
    const range = getVirtualRange({ viewportHeight: 300, scrollTop: 0, rowHeight: 30, count: 100 });
    expect(range.end).toBe(16);
  });
});
