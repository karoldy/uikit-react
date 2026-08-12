import { describe, expect, it } from 'vitest';
import { clampPage, getPageCount, getPageSlice } from '../src/utils/paginate';

describe('getPageCount', () => {
  it('计算总页数', () => {
    expect(getPageCount(25, 10)).toBe(3);
    expect(getPageCount(20, 10)).toBe(2);
  });

  it('空数据返回 0', () => {
    expect(getPageCount(0, 10)).toBe(0);
  });

  it('非法 pageSize 返回 0', () => {
    expect(getPageCount(10, 0)).toBe(0);
  });
});

describe('clampPage', () => {
  it('clamp 到合法范围(1-based)', () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(99, 3)).toBe(3);
  });

  it('无页时返回 1', () => {
    expect(clampPage(3, 0)).toBe(1);
  });
});

describe('getPageSlice', () => {
  it('第 1 页切片', () => {
    expect(getPageSlice(25, 1, 10)).toEqual({ start: 0, end: 10, pageCount: 3 });
  });

  it('最后一页不足 pageSize', () => {
    expect(getPageSlice(25, 3, 10)).toEqual({ start: 20, end: 25, pageCount: 3 });
  });

  it('页码越界自动 clamp', () => {
    expect(getPageSlice(25, 99, 10)).toEqual({ start: 20, end: 25, pageCount: 3 });
  });

  it('空数据安全', () => {
    expect(getPageSlice(0, 1, 10)).toEqual({ start: 0, end: 0, pageCount: 0 });
  });
});
