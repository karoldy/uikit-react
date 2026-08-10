import { createContext, useContext } from 'react';
import type { UsePopoverReturn } from './types';

export const PopoverContext = createContext<UsePopoverReturn | null>(null);

export function usePopoverContext(): UsePopoverReturn {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error('Popover compound components must be used within <Popover.Root>');
  }
  return ctx;
}
