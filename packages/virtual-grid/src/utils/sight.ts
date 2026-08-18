export interface SightProjection {
  client: number;
  scroll: number;
  position: number;
  exceed?: number;
}

export interface SightData<T> {
  start: T[];
  center: T[];
  end: T[];
}

export type SightItemSize<T> = (
  item: T,
  position: number,
  isRelativeToStartPosition: boolean,
) => number;

export function sight<T>(
  fnItemSize: SightItemSize<T> | null | undefined,
  projection: SightProjection,
  rules: Partial<SightData<T>> = {},
): SightData<T> {
  const { client = 0, scroll = 0, position = 0, exceed = 0 } = projection;

  const result: SightData<T> = {
    start: [],
    center: [],
    end: [],
  };

  const ruleless =
    !fnItemSize ||
    !client ||
    !scroll ||
    ((!rules.start || rules.start.length === 0) &&
      (!rules.center || rules.center.length === 0) &&
      (!rules.end || rules.end.length === 0));

  if (ruleless) return result;

  const current = {
    client,
    position: {
      start: 0,
      end: 0,
    },
  };

  const hasClient = () => current.client > 0;

  if (rules.start && rules.start.length > 0) {
    for (const item of rules.start) {
      if (item && hasClient()) {
        const value = fnItemSize(item, current.position.start, true);
        if (value) {
          result.start.push(item);
          current.position.start += value;
          current.client -= value;
        }
      }
    }
  }

  if (rules.end && rules.end.length > 0 && hasClient()) {
    for (let i = rules.end.length - 1; i >= 0; i -= 1) {
      const item = rules.end[i];
      if (item && hasClient()) {
        const value = fnItemSize(item, current.position.end, false);
        if (value) {
          current.position.end += value;
          current.client -= value;
          result.end.push(item);
        }
      }
    }
  }

  if (rules.center && rules.center.length > 0 && hasClient()) {
    const realClientStartPosition = current.position.start + position;
    const clientStartPosition = realClientStartPosition - exceed;
    const clientEndPosition = realClientStartPosition + current.client + exceed;

    for (const item of rules.center) {
      const startPosition = current.position.start;
      const value = fnItemSize(item, startPosition - position, true);

      if (value) {
        const endPosition = startPosition + value;

        const visible =
          (startPosition < clientStartPosition && endPosition > clientEndPosition) ||
          (startPosition >= clientStartPosition && startPosition <= clientEndPosition) ||
          (endPosition >= clientStartPosition && endPosition <= clientEndPosition);

        if (visible) result.center.push(item);

        current.position.start = endPosition;
      }
    }
  }

  return result;
}
