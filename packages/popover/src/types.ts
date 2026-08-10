import type * as React from 'react';
import type { Placement, Strategy, UseFloatingReturn } from '@floating-ui/react';
import type { FloatingFocusManagerProps } from '@floating-ui/react';

export interface UsePopoverOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  strategy?: Strategy;
  offset?: number;
  overflowPadding?: number;
  portal?: boolean;
  dismissible?: boolean;
  closeOnEsc?: boolean;
  /** 是否在浮层上显示箭头指示器，默认 false */
  arrow?: boolean;
  /** 是否将浮层尺寸约束在视口内（设置 maxHeight/maxWidth），默认 true */
  constrainViewport?: boolean;
  /** 浮层最小宽度（px） */
  minWidth?: number;
  /** 浮层最小高度（px） */
  minHeight?: number;
}

export interface UsePopoverReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  portal: boolean;
  arrow: boolean;
  arrowRef: React.RefCallback<SVGSVGElement | null>;
  arrowStyles: React.CSSProperties;
  refs: {
    reference: React.RefCallback<HTMLElement | null>;
    floating: React.RefCallback<HTMLElement | null>;
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  getTriggerProps: () => Record<string, unknown>;
  getContentProps: () => Record<string, unknown>;
  getCloseProps: () => Record<string, unknown>;
  floatingStyles: React.CSSProperties;
  context: UseFloatingReturn['context'];
  placement: Placement;
}

export interface PopoverRootProps extends UsePopoverOptions {
  children: React.ReactNode;
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Props passed to a slot component; inferred from `slots.*`. */
export type SlotPropsOf<T extends React.ElementType> = Partial<
  React.ComponentPropsWithoutRef<T>
> & {
  ref?: React.ComponentPropsWithRef<T>['ref'];
};

export interface PopoverContentSlots<
  TRoot extends React.ElementType = 'div',
  TArrow extends React.ElementType = React.ElementType,
> {
  /** Floating root node (positioned element). Default: `'div'`. */
  root?: TRoot;
  /** Arrow indicator when `arrow` is enabled on Root. Default: Floating UI `FloatingArrow`. */
  arrow?: TArrow;
}

/** Focus-trap options forwarded to Floating UI `FloatingFocusManager`. */
export type PopoverFocusManagerProps = Partial<
  Pick<
    FloatingFocusManagerProps,
    | 'modal'
    | 'initialFocus'
    | 'returnFocus'
    | 'closeOnFocusOut'
    | 'guards'
    | 'visuallyHiddenDismiss'
    | 'order'
    | 'disabled'
  >
>;

export interface PopoverContentSlotProps<
  TRoot extends React.ElementType = 'div',
  TArrow extends React.ElementType = React.ElementType,
> {
  root?: SlotPropsOf<TRoot>;
  arrow?: SlotPropsOf<TArrow>;
  /** Override FloatingFocusManager behavior (merged over library defaults). */
  focusManager?: PopoverFocusManagerProps;
}

export interface PopoverContentProps<
  TRoot extends React.ElementType = 'div',
  TArrow extends React.ElementType = React.ElementType,
> {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  /**
   * Replace internal parts. `slotProps.root` is typed from `slots.root`.
   * Ignored for the root when `asChild` is true (child becomes the floating node).
   */
  slots?: PopoverContentSlots<TRoot, TArrow>;
  slotProps?: PopoverContentSlotProps<TRoot, TArrow>;
}

export interface PopoverCloseProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface PopoverProps extends UsePopoverOptions {
  children: (api: UsePopoverReturn) => React.ReactNode;
}
