import { useContext, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { DataTableColumn } from '../types/column';
import { columnStyle } from '../utils/column-style';
import { cx } from '../utils/cx';
import { getValue } from '@uikit-react/hooks';
import { getStickyStyle } from '../utils/sticky';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { TableRowContext } from './TableRow';
import { useTableContext } from './table-context';

export interface TableCellProps extends HTMLAttributes<HTMLElement> {
  columnKey: string;
  children?: ReactNode;
}

export function TableCell({ columnKey, children, className, style, ...props }: TableCellProps) {
  const rowContext = useContext(TableRowContext);
  const {
    columns,
    markup,
    getRowSpacing,
    stickyOffsets,
    slots,
    slotProps,
    fallbacks,
    disableDefaultStyles,
  } = useTableContext();
  if (!rowContext) return null;

  const { row, index } = rowContext;
  const column = columns.find((item) => item.key === columnKey);
  if (!column) return null;

  const value = getValue(row, column.accessor);
  const dt = column as DataTableColumn<unknown>;
  const content =
    markup === 'native'
      ? String(value ?? '')
      : (dt.renderCell?.({ row, value, column: dt, index }) ?? String(value ?? ''));

  const spacing = markup === 'native' ? getRowSpacing?.({ row, index }) : undefined;
  const CellSlot = slots?.cell;
  const fallback = fallbacks.cell;
  const slot = CellSlot ?? fallback;
  const configured = (slotProps?.cell ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  const mergedProps: Record<string, unknown> = {
    ...props,
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, CellSlot, 'uikit-dt__cell'),
      configured.className as string | undefined,
      className,
    ),
    style: {
      ...columnStyle(column, getStickyStyle(column, stickyOffsets)),
      ...(spacing ? { paddingTop: spacing.top, paddingBottom: spacing.bottom } : undefined),
      ...style,
      ...configuredStyle,
    },
  };

  if (typeof slot !== 'string') {
    mergedProps.row = row;
    mergedProps.index = index;
    mergedProps.column = column;
    mergedProps.value = value;
  }

  return renderSlot(CellSlot, fallback, mergedProps, children ?? content);
}
