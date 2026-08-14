import { useLayoutEffect, useState, type RefObject } from 'react';

export function useScrollState(ref: RefObject<HTMLElement | null>): {
  scrollTop: number;
  scrollLeft: number;
} {
  const [scroll, setScroll] = useState({ scrollTop: 0, scrollLeft: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;

    const onScroll = () => {
      setScroll({
        scrollTop: el.scrollTop,
        scrollLeft: Math.abs(el.scrollLeft),
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref]);

  return scroll;
}
