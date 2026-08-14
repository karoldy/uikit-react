import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { TableHeaderCell } from './TableHeaderCell';
import { TableLoadingLine } from './TableSkeleton';
import { useTableContext } from './table-context';

export type TableHeaderRowProps = HTMLAttributes<HTMLElement>;

export function TableHeaderRow({ className, children, style, ...props }: TableHeaderRowProps) {
  const { columns, slots, slotProps, fallbacks, disableDefaultStyles, loading } = useTableContext();
  const configured = (slotProps?.headerRow ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const layoutStyle: CSSProperties = { display: 'flex', width: '100%' };

  const cells =
    children ??
    columns.map((column) => <TableHeaderCell key={column.key} columnKey={column.key} />);

  return renderSlot(
    slots?.headerRow,
    fallbacks.headerRow,
    {
      ...props,
      ...configured,
      className: cx(
        defaultSlotClass(disableDefaultStyles, slots?.headerRow, 'uikit-dt__header-row'),
        configured.className as string | undefined,
        className,
      ),
      style: {
        ...layoutStyle,
        ...style,
        ...configuredStyle,
      },
    },
    <>
      {cells}
      {loading === 'line' ? <TableLoadingLine /> : null}
    </>,
  );
}
