import { createContext, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { useTableContext } from './table-context';

export const TableRowContext = createContext<{ row: unknown; index: number } | null>(null);

export interface TableRowProps extends HTMLAttributes<HTMLElement> {
  index: number;
  children?: ReactNode;
}

export function TableRow({ index, children, className, style, ...props }: TableRowProps) {
  const { sortedRows, getRowSpacing, slots, slotProps, fallbacks, disableDefaultStyles } =
    useTableContext();
  const row = sortedRows[index];
  if (row === undefined) return null;

  const spacing = getRowSpacing?.({ row, index });
  const spaced = Boolean(spacing && (spacing.top !== 0 || spacing.bottom !== 0));
  const RowSlot = slots?.row;
  const fallback = fallbacks.row;
  const slot = RowSlot ?? fallback;
  const configured = (slotProps?.row ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  const layoutStyle: CSSProperties = {
    display: 'flex',
    width: '100%',
    ...(spacing ? { marginTop: spacing.top, marginBottom: spacing.bottom } : undefined),
  };

  const mergedProps: Record<string, unknown> = {
    ...props,
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, RowSlot, 'uikit-dt__row'),
      defaultSlotClass(disableDefaultStyles, RowSlot, spaced && 'uikit-dt__row--spaced'),
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
