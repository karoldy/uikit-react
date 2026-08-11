import { cloneElement, isValidElement } from 'react';
import type * as React from 'react';
import { usePopoverContext } from './popover-context';
import { mergeProps } from './merge-props';
import type { PopoverTriggerProps } from './types';

export function PopoverTrigger({ asChild = false, className, children }: PopoverTriggerProps) {
  const { getTriggerProps } = usePopoverContext();
  const slotProps = { ...getTriggerProps(), ...(className ? { className } : {}) };

  if (asChild) {
    if (
      !isValidElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>(
        children,
      )
    ) {
      throw new Error('PopoverTrigger: asChild requires a single valid React element child');
    }
    return cloneElement(children, mergeProps(slotProps, children.props as Record<string, unknown>));
  }

  return (
    <button type="button" {...slotProps} className={className}>
      {children}
    </button>
  );
}
