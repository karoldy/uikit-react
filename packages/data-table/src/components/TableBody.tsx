import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { TableCell } from './TableCell';
import { TableRow } from './TableRow';
import { useTableContext } from './table-context';

export type TableBodyProps = HTMLAttributes<HTMLElement>;

function DefaultBodyRows() {
  const { sortedRows, columns, getRowKey } = useTableContext();

  return sortedRows.map((_, index) => (
    <TableRow key={getRowKey?.(sortedRows[index], index) ?? index} index={index}>
      {columns.map((col) => (
        <TableCell key={col.key} columnKey={col.key} />
      ))}
    </TableRow>
  ));
}

export function TableBody({ className, children, style, ...props }: TableBodyProps) {
  const { slots, slotProps, fallbacks, disableDefaultStyles } = useTableContext();
  const configured = (slotProps?.body ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  return renderSlot(
    slots?.body,
    fallbacks.body,
    {
      ...props,
      ...configured,
      className: cx(
        defaultSlotClass(disableDefaultStyles, slots?.body, 'uikit-dt__body'),
        configured.className as string | undefined,
        className,
      ),
      style: {
        ...style,
        ...configuredStyle,
      },
    },
    children ?? <DefaultBodyRows />,
  );
}
