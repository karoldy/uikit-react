import { usePopover } from './use-popover';
import { PopoverContext } from './popover-context';
import type { PopoverRootProps } from './types';

export function PopoverRoot({ children, ...options }: PopoverRootProps) {
  const api = usePopover(options);
  return <PopoverContext.Provider value={api}>{children}</PopoverContext.Provider>;
}
