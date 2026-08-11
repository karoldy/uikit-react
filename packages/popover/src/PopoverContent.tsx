import { cloneElement, isValidElement } from 'react';
import type * as React from 'react';
import { FloatingPortal, FloatingFocusManager, FloatingArrow } from '@floating-ui/react';
import { usePopoverContext } from './popover-context';
import { mergeProps } from './merge-props';
import type { PopoverContentProps } from './types';

const DEFAULT_ARROW_PROPS = {
  width: 12,
  height: 6,
  fill: 'currentColor',
} as const;

/** Safe defaults for non-modal popovers (content may have no tabbables). */
const DEFAULT_FOCUS_MANAGER_PROPS = {
  modal: false,
  initialFocus: -1,
  returnFocus: false,
  closeOnFocusOut: false,
} as const;

export function PopoverContent<
  TRoot extends React.ElementType = 'div',
  TArrow extends React.ElementType = typeof FloatingArrow,
>(props: PopoverContentProps<TRoot, TArrow>) {
  const { asChild = false, className, children, slots, slotProps } = props;

  const { open, portal, context, arrow, arrowRef, arrowStyles, getContentProps } =
    usePopoverContext();

  if (!open) return null;

  const contentProps = getContentProps();

  let floating: React.ReactNode;

  if (asChild) {
    if (
      !isValidElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>(
        children,
      )
    ) {
      throw new Error('PopoverContent: asChild requires a single valid React element child');
    }
    // Child becomes the floating node. `slots.root` does not apply in asChild mode.
    floating = cloneElement(
      children,
      mergeProps(
        { ...contentProps, ...(className ? { className } : {}) },
        children.props as Record<string, unknown>,
      ),
    );
  } else {
    const Root = (slots?.root ?? 'div') as React.ElementType;
    const mergedRootProps = mergeProps(
      { ...contentProps, ...(className ? { className } : {}) },
      (slotProps?.root ?? {}) as Record<string, unknown>,
    );

    const Arrow = (slots?.arrow ?? FloatingArrow) as React.ElementType;
    const mergedArrowProps = mergeProps(
      {
        ref: arrowRef,
        context,
        ...DEFAULT_ARROW_PROPS,
        style: {
          ...arrowStyles,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))',
        },
      },
      (slotProps?.arrow ?? {}) as Record<string, unknown>,
    );

    const focusManagerProps = {
      ...DEFAULT_FOCUS_MANAGER_PROPS,
      ...slotProps?.focusManager,
      context,
    };

    floating = (
      <Root {...mergedRootProps}>
        <FloatingFocusManager {...focusManagerProps}>
          <div>{children}</div>
        </FloatingFocusManager>
        {arrow ? <Arrow {...mergedArrowProps} /> : null}
      </Root>
    );
  }

  return portal ? <FloatingPortal>{floating}</FloatingPortal> : floating;
}
