import type { CSSProperties } from 'react';
import { columnStyle } from '../utils/column-style';
import { cx } from '../utils/cx';
import { getStickyStyle } from '../utils/sticky';
import { DEFAULT_SKELETON_ROWS } from '../types/loading';
import { defaultSlotClass } from './default-slot-class';
import { renderSlot } from './render-slot';
import { useTableContext } from './table-context';

export function TableSkeletonRows() {
  const {
    columns,
    sortedRows,
    loading,
    skeletonRows,
    stickyOffsets,
    disableDefaultStyles,
    slots,
    slotProps,
  } = useTableContext();

  if (loading !== 'row' && loading !== 'cell') return null;

  const count = skeletonRows ?? (sortedRows.length > 0 ? sortedRows.length : DEFAULT_SKELETON_ROWS);
  const slot = loading === 'row' ? slots?.loadingRow : slots?.loadingCell;
  const configured = ((loading === 'row' ? slotProps?.loadingRow : slotProps?.loadingCell) ??
    {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;

  if (slot) {
    const merged: Record<string, unknown> = {
      ...configured,
      className: configured.className as string | undefined,
      style: configuredStyle,
    };
    if (typeof slot !== 'string') {
      merged.count = count;
      merged.columns = columns;
    }
    return renderSlot(slot, 'div', merged);
  }

  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cx(
        !disableDefaultStyles && 'uikit-dt__row',
        !disableDefaultStyles && 'uikit-dt__row--skeleton',
      )}
    >
      {loading === 'row' ? (
        <span
          className={cx(
            !disableDefaultStyles && 'uikit-dt__skeleton',
            !disableDefaultStyles && 'uikit-dt__skeleton--row',
          )}
        />
      ) : (
        columns.map((column) => (
          <div
            key={column.key}
            className={cx(!disableDefaultStyles && 'uikit-dt__cell')}
            style={columnStyle(column, getStickyStyle(column, stickyOffsets, 'cell'))}
          >
            <span className={cx(!disableDefaultStyles && 'uikit-dt__skeleton')} />
          </div>
        ))
      )}
    </div>
  ));
}

export function TableLoadingLine() {
  const { slots, slotProps, disableDefaultStyles } = useTableContext();
  const configured = (slotProps?.loadingLine ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const slot = slots?.loadingLine;
  const merged: Record<string, unknown> = {
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, slot, 'uikit-dt__loading-line'),
      configured.className as string | undefined,
    ),
    style: configuredStyle,
  };
  return renderSlot(slot, 'div', merged);
}

export function TableLoadingSpin() {
  const { slots, slotProps, disableDefaultStyles } = useTableContext();
  const configured = (slotProps?.loadingSpin ?? {}) as Record<string, unknown>;
  const configuredStyle = configured.style as CSSProperties | undefined;
  const slot = slots?.loadingSpin;
  const merged: Record<string, unknown> = {
    ...configured,
    className: cx(
      defaultSlotClass(disableDefaultStyles, slot, 'uikit-dt__spin'),
      configured.className as string | undefined,
    ),
    style: configuredStyle,
  };
  const icon = (
    <span className={cx(!disableDefaultStyles && slot === undefined && 'uikit-dt__spin-icon')} />
  );
  return renderSlot(slot, 'div', merged, icon);
}
