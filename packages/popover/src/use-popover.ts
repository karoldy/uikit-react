import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  flip,
  shift,
  offset as offsetMiddleware,
  arrow as arrowMiddleware,
  size as sizeMiddleware,
  autoUpdate,
} from '@floating-ui/react';
import { useState, useCallback, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { UsePopoverOptions, UsePopoverReturn } from './types';

const DEFAULTS = {
  defaultOpen: false,
  placement: 'bottom-start' as const,
  strategy: 'absolute' as const,
  offset: 6,
  overflowPadding: 8,
  portal: true,
  dismissible: true,
  closeOnEsc: true,
  arrow: false,
  constrainViewport: true,
};

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    defaultOpen = DEFAULTS.defaultOpen,
    open: controlledOpen,
    onOpenChange,
    placement = DEFAULTS.placement,
    strategy = DEFAULTS.strategy,
    offset = DEFAULTS.offset,
    overflowPadding = DEFAULTS.overflowPadding,
    portal = DEFAULTS.portal,
    dismissible = DEFAULTS.dismissible,
    closeOnEsc = DEFAULTS.closeOnEsc,
    arrow = DEFAULTS.arrow,
    constrainViewport = DEFAULTS.constrainViewport,
    minWidth,
    minHeight,
  } = options;

  const arrowRef = useRef<SVGSVGElement | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // 有 arrow 时默认间距更大，确保箭头不贴边
  const effectiveOffset = arrow && offset === DEFAULTS.offset ? 8 : offset;

  const middleware = useMemo(() => {
    const items = [offsetMiddleware(effectiveOffset), flip(), shift({ padding: overflowPadding })];
    if (arrow) items.push(arrowMiddleware({ element: arrowRef }));
    if (constrainViewport || minWidth !== undefined || minHeight !== undefined) {
      items.push(
        sizeMiddleware({
          apply({ availableHeight, availableWidth, elements }) {
            const style: Record<string, string> = {};
            if (constrainViewport) {
              style.maxHeight = `${Math.max(availableHeight, 0)}px`;
              style.maxWidth = `${Math.max(availableWidth, 0)}px`;
            }
            if (minWidth !== undefined) style.minWidth = `${minWidth}px`;
            if (minHeight !== undefined) style.minHeight = `${minHeight}px`;
            Object.assign(elements.floating.style, style);
          },
          padding: overflowPadding,
        }),
      );
    }
    return items;
  }, [minWidth, minHeight, effectiveOffset, overflowPadding, arrow, constrainViewport]);

  const {
    context,
    refs: floatingRefs,
    floatingStyles,
    middlewareData,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement,
    strategy,
    middleware,
  });

  // Adapter: floating-ui exposes MutableRefObject refs and
  // setReference(node: Element | VirtualElement | null), while the spec's
  // UsePopoverReturn.refs declares RefCallback<HTMLElement> refs.
  const refs = useMemo<UsePopoverReturn['refs']>(
    () => ({
      reference: (node) => floatingRefs.setReference(node),
      floating: (node) => floatingRefs.setFloating(node),
      setReference: floatingRefs.setReference,
      setFloating: floatingRefs.setFloating,
    }),
    [floatingRefs],
  );

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    enabled: dismissible,
    escapeKey: closeOnEsc,
  });
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const getTriggerProps = useCallback(
    (): Record<string, unknown> =>
      getReferenceProps({
        ref: refs.setReference,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
      }),
    [getReferenceProps, refs.setReference, open],
  );

  const getContentProps = useCallback(
    (): Record<string, unknown> =>
      getFloatingProps({
        ref: refs.setFloating,
        style: floatingStyles,
      }),
    [getFloatingProps, refs.setFloating, floatingStyles],
  );

  const getCloseProps = useCallback(
    (): Record<string, unknown> => ({
      onClick: () => setOpen(false),
      type: 'button' as const,
    }),
    [setOpen],
  );

  const arrowStyles: CSSProperties = useMemo(() => {
    if (!arrow || !middlewareData.arrow) return {};
    const { x, y } = middlewareData.arrow;
    return {
      left: x !== null && x !== undefined ? `${x}px` : '',
      top: y !== null && y !== undefined ? `${y}px` : '',
    };
  }, [arrow, middlewareData.arrow]);

  const setArrowRef = useCallback<UsePopoverReturn['arrowRef']>((node) => {
    arrowRef.current = node;
  }, []);

  return {
    open,
    setOpen,
    portal,
    arrow,
    arrowRef: setArrowRef,
    arrowStyles,
    refs,
    getTriggerProps,
    getContentProps,
    getCloseProps,
    floatingStyles,
    context,
    placement,
  };
}
