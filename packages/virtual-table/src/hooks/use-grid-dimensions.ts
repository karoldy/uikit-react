import { useLayoutEffect, useState, type RefObject } from 'react';

export function useGridDimensions(ref: RefObject<HTMLElement | null>): {
  width: number;
  height: number;
} {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;

    const measure = () => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}
