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
  const { columns, stickyOffsets, slots, slotProps, fallbacks, disableDefaultStyles } =
    useTableContext();
  if (!rowContext) return null;

  const { row, index } = rowContext;
  const column = columns.find((item) => item.key === columnKey);
  if (!column) return null;

  const value = getValue(row, column.accessor);
  const dt = column as DataTableColumn<unknown>;
  const content = dt.renderCell?.({ row, value, column: dt, index }) ?? String(value ?? '');
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
      defaultSlotClass(
        disableDefaultStyles,
        CellSlot,
        column.fixed ? 'uikit-dt__cell--frozen' : false,
      ),
      defaultSlotClass(
        disableDefaultStyles,
        CellSlot,
        column.fixed === 'left' ? 'uikit-dt__cell--frozen-left' : false,
      ),
      defaultSlotClass(
        disableDefaultStyles,
        CellSlot,
        column.fixed === 'right' ? 'uikit-dt__cell--frozen-right' : false,
      ),
      configured.className as string | undefined,
      className,
    ),
    style: {
      ...columnStyle(column, undefined),
      ...configuredStyle,
      ...style,
      ...getStickyStyle(column, stickyOffsets, 'cell'),
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
