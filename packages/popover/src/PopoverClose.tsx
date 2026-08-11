import { cloneElement, isValidElement } from 'react';
import type * as React from 'react';
import { usePopoverContext } from './popover-context';
import { mergeProps } from './merge-props';
import type { PopoverCloseProps } from './types';

export function PopoverClose({ asChild = false, className, children }: PopoverCloseProps) {
  const { getCloseProps } = usePopoverContext();
  const slotProps = { ...getCloseProps(), ...(className ? { className } : {}) };

  if (asChild) {
    if (
      !isValidElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>(
        children,
      )
    ) {
      throw new Error('PopoverClose: asChild requires a single valid React element child');
    }
    return cloneElement(children, mergeProps(slotProps, children.props as Record<string, unknown>));
  }

  return (
    <button {...slotProps} className={className}>
      {children}
    </button>
  );
}
