import type * as React from 'react';

type AnyProps = Record<string, unknown>;

function composeEventHandlers<E>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: ((event: E) => void) | undefined,
) {
  return (event: E) => {
    theirHandler?.(event);
    if (
      event &&
      typeof event === 'object' &&
      'defaultPrevented' in event &&
      (event as { defaultPrevented?: boolean }).defaultPrevented
    ) {
      return;
    }
    ourHandler?.(event);
  };
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/** Merge slot props onto a child element (asChild), composing className / handlers / ref. */
export function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const override: AnyProps = { ...childProps, ...slotProps };

  if (childProps.className || slotProps.className) {
    override.className = [childProps.className, slotProps.className].filter(Boolean).join(' ');
  }

  const childRef = childProps.ref as React.Ref<unknown> | undefined;
  const slotRef = slotProps.ref as React.Ref<unknown> | undefined;
  if (childRef || slotRef) {
    override.ref = composeRefs(childRef, slotRef);
  }

  for (const key of Object.keys(slotProps)) {
    if (!key.startsWith('on') || typeof slotProps[key] !== 'function') continue;
    const their = childProps[key];
    const ours = slotProps[key];
    if (typeof their === 'function') {
      override[key] = composeEventHandlers(
        their as (event: unknown) => void,
        ours as (event: unknown) => void,
      );
    }
  }

  return override;
}
