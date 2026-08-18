const UNLIMITED = -1;

export interface FlexRule<T = Record<string, unknown>> {
  flexible?: boolean;
  value: number;
  min?: number;
  max?: number;
  rest?: T;
}

interface InternalRule<T> extends FlexRule<T> {
  widen: number;
  narrow: number;
}

function widen<T>(gap: number, widenNumber: number, rules: InternalRule<T>[]): InternalRule<T>[] {
  if (!gap || !widenNumber || rules.length === 0) return rules;

  const unit = gap / widenNumber;
  const newRules: InternalRule<T>[] = [];
  const temp = { gap: 0, widenNumber: 0 };

  for (const rule of rules) {
    const newRule = { ...rule };

    if (newRule.flexible && newRule.widen !== 0) {
      const currWiden = newRule.widen === UNLIMITED ? unit : Math.min(unit, newRule.widen);

      newRule.value += currWiden;
      newRule.widen = newRule.widen === UNLIMITED ? UNLIMITED : newRule.widen - currWiden;

      temp.gap += unit - currWiden;
      if (newRule.widen !== 0) temp.widenNumber += 1;
    }

    newRules.push(newRule);
  }

  return widen(temp.gap, temp.widenNumber, newRules);
}

function narrow<T>(gap: number, narrowNumber: number, rules: InternalRule<T>[]): InternalRule<T>[] {
  if (!gap || !narrowNumber || rules.length === 0) return rules;

  const unit = gap / narrowNumber;
  const newRules: InternalRule<T>[] = [];
  const temp = { gap: 0, narrowNumber: 0 };

  for (const rule of rules) {
    const newRule = { ...rule };

    if (newRule.flexible && newRule.narrow !== 0) {
      const currNarrow = newRule.narrow === UNLIMITED ? unit : Math.min(unit, newRule.narrow);

      newRule.value -= currNarrow;
      newRule.narrow = newRule.narrow === UNLIMITED ? UNLIMITED : newRule.narrow - currNarrow;

      temp.gap += unit - currNarrow;
      if (newRule.narrow !== 0) temp.narrowNumber += 1;
    }

    newRules.push(newRule);
  }

  return narrow(temp.gap, temp.narrowNumber, newRules);
}

export function flex<TItem, TRule extends FlexRule>(
  fn: (rule: TRule & { value: number }) => TItem | false | null | undefined,
  limit: number,
  rules: readonly (TRule | null | undefined)[],
): TItem[] {
  if (!limit || rules.length === 0) return [];

  const newRules: InternalRule<Record<string, unknown>>[] = [];
  const temp = { sum: 0, widenNumber: 0, narrowNumber: 0 };

  for (const rule of rules) {
    if (!rule) continue;

    const { flexible, value, min, max, ...rest } = rule;

    const newRule: InternalRule<Record<string, unknown>> = {
      rest,
      flexible,
      value,
      widen: UNLIMITED,
      narrow: UNLIMITED,
    };

    if (min !== undefined || max !== undefined) {
      if (min !== undefined && max === undefined) {
        newRule.value = Math.max(min, newRule.value);
        newRule.narrow = newRule.value - min;
      } else if (min === undefined && max !== undefined) {
        newRule.value = Math.min(max, newRule.value);
        newRule.widen = max - newRule.value;
      } else if (min !== undefined && max !== undefined && min <= max) {
        newRule.value = Math.min(Math.max(min, newRule.value), max);
        newRule.widen = max - newRule.value;
        newRule.narrow = newRule.value - min;
      } else if (min !== undefined) {
        newRule.value = Math.max(min, newRule.value);
        newRule.narrow = newRule.value - min;
      }
    }

    temp.sum += newRule.value;
    if (newRule.flexible) {
      if (newRule.widen !== 0) temp.widenNumber += 1;
      if (newRule.narrow !== 0) temp.narrowNumber += 1;
    }

    newRules.push(newRule);
  }

  const gap = limit - temp.sum;

  const finalRules =
    gap > 0
      ? widen(gap, temp.widenNumber, newRules)
      : gap < 0
        ? narrow(-gap, temp.narrowNumber, newRules)
        : newRules;

  const result: TItem[] = [];

  for (const { rest, ...rule } of finalRules) {
    if (rule.value <= 0) continue;
    const item = fn({ ...(rest as TRule), ...rule });
    if (item) result.push(item);
  }

  return result;
}
