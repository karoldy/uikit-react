import { useContext, type CSSProperties, type HTMLAttributes, type Ref } from 'react';
import { useVirtualRows } from '../hooks/use-virtual-rows';
import { cx } from '../utils/cx';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { TableCell } from './TableCell';
import { TableRow, VirtualItemsContext } from './TableRow';
import { useTableContext } from './table-context';

export type TableBodyProps = HTMLAttributes<HTMLElement>;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (ref === undefined || ref === null) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

function DefaultBodyRows() {
  const { sortedRows, columns, getRowKey, rowHeight } = useTableContext();
  const items = useContext(VirtualItemsContext);
  const indexes =
    rowHeight !== undefined && items
      ? items.map((item) => item.index)
      : sortedRows.map((_, i) => i);

  return indexes.map((index) => (
    <TableRow key={getRowKey?.(sortedRows[index], index) ?? index} index={index}>
      {columns.map((col) => (
        <TableCell key={col.key} columnKey={col.key} />
      ))}
    </TableRow>
  ));
}

function StaticBody({ className, children, style, ...props }: TableBodyProps) {
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

function VirtualBody({ className, children, style, ...props }: TableBodyProps) {
  const {
    sortedRows,
    getRowSpacing,
    rowHeight,
    overscan,
    slots,
    slotProps,
    fallbacks,
    disableDefaultStyles,
  } = useTableContext();
  const spacing =
    sortedRows.length > 0 ? getRowSpacing?.({ row: sortedRows[0], index: 0 }) : undefined;
  const { containerRef, totalHeight, virtualItems } = useVirtualRows({
    count: sortedRows.length,
    rowHeight: rowHeight as number,
    spacing,
    overscan,
  });
  const configured = (slotProps?.body ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const configuredRef = configured.ref as Ref<HTMLElement> | undefined;

  return (
    <VirtualItemsContext.Provider value={virtualItems}>
      {renderSlot(
        slots?.body,
        fallbacks.body,
        {
          ...props,
          ...configured,
          ref: mergeRefs(containerRef as Ref<HTMLElement>, configuredRef),
          className: cx(
            defaultSlotClass(disableDefaultStyles, slots?.body, 'uikit-dt__body'),
            configured.className as string | undefined,
            className,
          ),
          style: {
            height: totalHeight,
            position: 'relative',
            ...style,
            ...configuredStyle,
          },
        },
        children ?? <DefaultBodyRows />,
      )}
    </VirtualItemsContext.Provider>
  );
}

export function TableBody(props: TableBodyProps) {
  const { rowHeight } = useTableContext();
  if (rowHeight !== undefined) {
    return <VirtualBody {...props} />;
  }
  return <StaticBody {...props} />;
}
