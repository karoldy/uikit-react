import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import type { VirtualRow } from '../hooks/use-virtual-rows';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { useTableContext } from './table-context';

export const TableRowContext = createContext<{ row: unknown; index: number } | null>(null);

export const VirtualItemsContext = createContext<VirtualRow[] | null>(null);

export interface TableRowProps extends HTMLAttributes<HTMLElement> {
  index: number;
  children?: ReactNode;
}

export function TableRow({ index, children, className, style, ...props }: TableRowProps) {
  const { sortedRows, markup, getRowSpacing, slots, slotProps, fallbacks, disableDefaultStyles } =
    useTableContext();
  const virtualItems = useContext(VirtualItemsContext);
  const row = sortedRows[index];
  if (row === undefined) return null;

  const item = virtualItems?.find((virtualItem) => virtualItem.index === index);
  const spacing = item ? undefined : getRowSpacing?.({ row, index });
  const RowSlot = slots?.row;
  const fallback = fallbacks.row;
  const slot = RowSlot ?? fallback;
  const configured = (slotProps?.row ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  let layoutStyle: CSSProperties | undefined;
  if (item) {
    layoutStyle = {
      position: 'absolute',
      top: item.offsetTop,
      left: 0,
      right: 0,
      display: 'flex',
      paddingTop: item.spacingTop,
      paddingBottom: item.spacingBottom,
    };
  } else if (markup === 'div') {
    layoutStyle = {
      display: 'flex',
      ...(spacing ? { paddingTop: spacing.top, paddingBottom: spacing.bottom } : undefined),
    };
  }

  const mergedProps: Record<string, unknown> = {
    ...props,
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, RowSlot, 'uikit-dt__row'),
      configured.className as string | undefined,
      className,
    ),
    style: {
      ...layoutStyle,
      ...style,
      ...configuredStyle,
    },
  };

  if (typeof slot !== 'string') {
    mergedProps.row = row;
    mergedProps.index = index;
  }

  return (
    <TableRowContext.Provider value={{ row, index }}>
      {renderSlot(RowSlot, fallback, mergedProps, children)}
    </TableRowContext.Provider>
  );
}
