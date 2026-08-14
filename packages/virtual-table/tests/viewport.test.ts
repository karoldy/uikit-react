import { describe, expect, it } from 'vitest';
import { findIndexByOffset, findIndexByPrefix, getViewportRange } from '../src/utils/viewport';

describe('getViewportRange', () => {
  it('行：300px 视口、30px 行高、overscan 4', () => {
    const r = getViewportRange({
      offset: 0,
      viewportSize: 300,
      itemSize: 30,
      count: 100,
      overscan: 4,
    });
    expect(r).toEqual({ start: 0, end: 14 }); // visible 0..10 + overscan 4
  });

  it('行：scrollTop 600', () => {
    const r = getViewportRange({
      offset: 600,
      viewportSize: 300,
      itemSize: 30,
      count: 100,
      overscan: 4,
    });
    // firstVisible=20, lastVisible=floor(900/30)=30, ±4 → 16..34
    expect(r.start).toBe(16);
    expect(r.end).toBe(34);
  });

  it('overscan 默认 4', () => {
    const r = getViewportRange({
      offset: 0,
      viewportSize: 300,
      itemSize: 30,
      count: 100,
    });
    expect(r).toEqual({ start: 0, end: 14 });
  });

  it('count===0 时 {start:0,end:0}', () => {
    expect(
      getViewportRange({
        offset: 0,
        viewportSize: 300,
        itemSize: 30,
        count: 0,
      }),
    ).toEqual({ start: 0, end: 0 });
  });

  it('end 夹到 count-1', () => {
    const r = getViewportRange({
      offset: 2700,
      viewportSize: 300,
      itemSize: 30,
      count: 100,
      overscan: 4,
    });
    // firstVisible=90, lastVisible=floor(3000/30)=100 clamped → 99, ±4 → 86..99
    expect(r.start).toBe(86);
    expect(r.end).toBe(99);
  });
});

describe('findIndexByOffset', () => {
  it('按 offset/itemSize 取整并夹到 [0, count-1]', () => {
    expect(findIndexByOffset(0, 30, 100)).toBe(0);
    expect(findIndexByOffset(600, 30, 100)).toBe(20);
    expect(findIndexByOffset(2999, 30, 100)).toBe(99);
    expect(findIndexByOffset(9000, 30, 100)).toBe(99);
  });

  it('count<=0 或 itemSize<=0 返回 0', () => {
    expect(findIndexByOffset(100, 30, 0)).toBe(0);
    expect(findIndexByOffset(100, 0, 10)).toBe(0);
    expect(findIndexByOffset(100, -10, 10)).toBe(0);
  });
});

describe('findIndexByPrefix', () => {
  it('列：变宽前缀', () => {
    const prefix = [0, 80, 200, 280, 400]; // 4 cols
    expect(findIndexByPrefix(0, prefix)).toBe(0);
    expect(findIndexByPrefix(80, prefix)).toBe(1);
    expect(findIndexByPrefix(279, prefix)).toBe(2);
  });

  it('空或 offset<=0 返回 0', () => {
    expect(findIndexByPrefix(10, [])).toBe(0);
    expect(findIndexByPrefix(0, [0, 80, 200])).toBe(0);
    expect(findIndexByPrefix(-1, [0, 80, 200])).toBe(0);
  });

  it('二分找最大 i 使 prefix[i] <= offset', () => {
    const prefix = [0, 80, 200, 280, 400];
    expect(findIndexByPrefix(81, prefix)).toBe(1);
    expect(findIndexByPrefix(199, prefix)).toBe(1);
    expect(findIndexByPrefix(200, prefix)).toBe(2);
    expect(findIndexByPrefix(400, prefix)).toBe(4);
    expect(findIndexByPrefix(999, prefix)).toBe(4);
  });
});
