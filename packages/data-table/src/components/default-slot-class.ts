import type { ElementType } from 'react';

/** Built-in fallbacks get BEM classes; a caller-provided slot does not. */
export function defaultSlotClass(
  disableDefaultStyles: boolean,
  slot: ElementType | undefined,
  className: string | false,
): string | false {
  return !disableDefaultStyles && slot === undefined && className;
}
