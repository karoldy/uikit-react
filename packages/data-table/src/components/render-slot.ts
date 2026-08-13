import { createElement, type ElementType, type ReactNode } from 'react';

export function renderSlot(
  slot: ElementType | undefined,
  fallback: ElementType,
  props: Record<string, unknown>,
  children?: ReactNode,
) {
  return createElement(slot ?? fallback, props, children);
}
