import type { MouseEvent } from 'react';

export function composeClickHandlers(
  external: ((event: MouseEvent<HTMLElement>) => void) | undefined,
  internal: (event: MouseEvent<HTMLElement>) => void,
) {
  return (event: MouseEvent<HTMLElement>) => {
    external?.(event);
    if (!event.defaultPrevented) {
      internal(event);
    }
  };
}
