import { cx } from '../utils/cx';
import type { HTMLAttributes } from 'react';
import type { CellProps } from '../types/grid';

export const WIDTH_BORDER = 1;

export function Cell({
  className,
  style,
  odd,
  even,
  align,
  border,
  children,
  ...rest
}: CellProps & HTMLAttributes<HTMLDivElement>) {
  const width = style?.width ?? 0;
  const height = style?.height ?? 0;
  const top = style?.top ?? 0;
  const left = style?.left ?? 0;

  const alignClasses = cx(
    'uikit-grid__cell-align',
    align?.vertical === 'start' && 'uikit-grid__cell-align--v-start',
    align?.vertical === 'end' && 'uikit-grid__cell-align--v-end',
    align?.horizontal === 'start' && 'uikit-grid__cell-align--h-start',
    align?.horizontal === 'end' && 'uikit-grid__cell-align--h-end',
  );

  return (
    <div
      {...rest}
      className={cx(
        'uikit-grid__cell',
        odd && 'uikit-grid__cell--odd',
        even && 'uikit-grid__cell--even',
        border?.vertical === false && 'uikit-grid__cell--no-v-border',
        border?.horizontal === false && 'uikit-grid__cell--no-h-border',
        alignClasses,
        className,
      )}
      style={{
        ...style,
        position: 'absolute',
        width: Number(width) + WIDTH_BORDER,
        height: Number(height) + WIDTH_BORDER,
        top: Number(top) - WIDTH_BORDER,
        left: Number(left) - WIDTH_BORDER,
      }}
    >
      {children}
    </div>
  );
}
