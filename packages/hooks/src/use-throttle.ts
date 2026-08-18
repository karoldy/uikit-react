import { useCallback, useEffect, useRef } from 'react';

export type UseThrottleCancel = () => void;

/**
 * Throttle callback with cancel.
 * Returns `[throttledFn, cancel]`.
 */
export function useThrottle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 300,
): [(...args: TArgs) => void, UseThrottleCancel] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRunRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const throttledFn = useCallback(
    (...args: TArgs) => {
      const now = Date.now();
      const remaining = delay - (now - lastRunRef.current);

      if (remaining <= 0) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          timerRef.current = null;
          callbackRef.current(...args);
        }, remaining);
      }
    },
    [delay],
  );

  const cancel = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return [throttledFn, cancel];
}
