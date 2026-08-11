import { describe, expect, it } from 'vitest';
import { buildCalendarMatrix } from '../src/utils/calendar-matrix';

describe('buildCalendarMatrix', () => {
  it('returns 42 cells for August 2026 with weekStartsOn Monday', () => {
    const matrix = buildCalendarMatrix('2026-08', 1);
    expect(matrix).toHaveLength(42);
  });

  it('starts with late July when August 2026 begins on Saturday and week starts Monday', () => {
    const matrix = buildCalendarMatrix('2026-08', 1);
    expect(matrix[0]).toEqual({
      date: '2026-07-27',
      inCurrentMonth: false,
    });
  });

  it('marks the first of the month as inCurrentMonth', () => {
    const matrix = buildCalendarMatrix('2026-08', 1);
    const aug1 = matrix.find((cell) => cell.date === '2026-08-01');
    expect(aug1).toEqual({
      date: '2026-08-01',
      inCurrentMonth: true,
    });
  });

  it('defaults weekStartsOn to Monday', () => {
    const matrix = buildCalendarMatrix('2026-08');
    expect(matrix[0].date).toBe('2026-07-27');
  });

  it('marks trailing days from the next month as out of current month', () => {
    const matrix = buildCalendarMatrix('2026-08', 1);
    const lastCell = matrix[matrix.length - 1];
    expect(lastCell.inCurrentMonth).toBe(false);
    expect(lastCell.date).toMatch(/^2026-09-/);
  });
});
