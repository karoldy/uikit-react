import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { DataTableColumn } from '../types/column';
import { columnStyle } from '../utils/column-style';
import { cx } from '../utils/cx';
import { getStickyStyle } from '../utils/sticky';
import { composeClickHandlers } from './compose-click-handlers';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { useTableContext } from './table-context';

export interface TableHeaderCellProps extends HTMLAttributes<HTMLElement> {
  columnKey: string;
}

export function TableHeaderCell({
  columnKey,
  children,
  className,
  onClick,
  style,
  ...props
}: TableHeaderCellProps) {
  const {
    columns,
    getSortDirection,
    toggleSort,
    stickyOffsets,
    renderSortIndicator,
    slots,
    slotProps,
    fallbacks,
    disableDefaultStyles,
  } = useTableContext();

  const column = columns.find((item) => item.key === columnKey);
  if (!column) return null;

  const sorted = getSortDirection(columnKey) ?? false;
  const dataColumn = column as DataTableColumn<unknown>;
  const label = dataColumn.renderHeaderCell?.({ column: dataColumn }) ?? column.header;
  const sortable = column.sortable !== false;
  const HeaderCellSlot = slots?.headerCell;
  const fallback = fallbacks.headerCell;
  const slot = HeaderCellSlot ?? fallback;
  const configured = (slotProps?.headerCell ?? {}) as Record<string, unknown>;
  const configuredOnClick = configured.onClick as
    ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const configuredStyle = configured.style as CSSProperties | undefined;

  const mergedProps: Record<string, unknown> = {
    ...props,
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, HeaderCellSlot, 'uikit-dt__header-cell'),
      defaultSlotClass(
        disableDefaultStyles,
        HeaderCellSlot,
        sorted === 'asc' && 'uikit-dt__header-cell--sorted-asc',
      ),
      defaultSlotClass(
        disableDefaultStyles,
        HeaderCellSlot,
        sorted === 'desc' && 'uikit-dt__header-cell--sorted-desc',
      ),
      configured.className as string | undefined,
      className,
    ),
    style: {
      ...columnStyle(column, getStickyStyle(column, stickyOffsets)),
      ...style,
      ...configuredStyle,
    },
    onClick:
      configuredOnClick || onClick
        ? composeClickHandlers(
            configuredOnClick,
            (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined) ?? (() => {}),
          )
        : onClick,
  };

  if (typeof slot !== 'string') {
    mergedProps.column = column;
    mergedProps.label = label;
    mergedProps.sortable = sortable;
    mergedProps.sorted = sorted;
    mergedProps.fixed = column.fixed ?? false;
  }

  const indicator = renderSortIndicator(sorted === false ? undefined : sorted);
  const defaultChildren: ReactNode = sortable ? (
    <button type="button" onClick={composeClickHandlers(undefined, () => toggleSort(columnKey))}>
      {label}
      {indicator}
    </button>
  ) : (
    label
  );

  return renderSlot(HeaderCellSlot, fallback, mergedProps, children ?? defaultChildren);
}
