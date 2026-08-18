import { useCallback, useEffect, useRef } from 'react';

export type UseDebounceCancel = () => void;

/**
 * Debounce callback with cancel.
 * Returns `[debouncedFn, cancel]`.
 */
export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 300,
): [(...args: TArgs) => void, UseDebounceCancel] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debouncedFn = useCallback(
    (...args: TArgs) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  const cancel = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return [debouncedFn, cancel];
}
