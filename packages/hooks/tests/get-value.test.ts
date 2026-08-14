import { describe, expect, it } from 'vitest';
import { getValue } from '../src/sorting/get-value';

interface Row {
  id: number;
  name: string;
}

const row: Row = { id: 1, name: 'alice' };

describe('getValue', () => {
  it('按 key 取值', () => {
    expect(getValue(row, 'id')).toBe(1);
    expect(getValue(row, 'name')).toBe('alice');
  });

  it('按函数取值', () => {
    expect(getValue(row, (r) => r.name.toUpperCase())).toBe('ALICE');
  });

  it('函数访问器接收整行', () => {
    const accessor = (r: Row) => `${r.id}-${r.name}`;
    expect(getValue(row, accessor)).toBe('1-alice');
  });
});
