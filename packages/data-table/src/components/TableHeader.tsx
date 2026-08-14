import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { useTableContext } from './table-context';

export type TableHeaderProps = HTMLAttributes<HTMLElement>;

export function TableHeader({ className, children, style, ...props }: TableHeaderProps) {
  const { slots, slotProps, fallbacks, disableDefaultStyles, markup } = useTableContext();
  const configured = (slotProps?.header ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const layoutStyle: CSSProperties | undefined = markup === 'div' ? { width: '100%' } : undefined;

  return renderSlot(
    slots?.header,
    fallbacks.header,
    {
      ...props,
      ...configured,
      className: cx(
        defaultSlotClass(disableDefaultStyles, slots?.header, 'uikit-dt__header'),
        configured.className as string | undefined,
        className,
      ),
      style: {
        ...layoutStyle,
        ...style,
        ...configuredStyle,
      },
    },
    children,
  );
}
