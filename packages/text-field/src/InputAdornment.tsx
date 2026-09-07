import type { InputAdornmentProps } from './types';
import { cx } from './cx';

export function InputAdornment({ position, children, className }: InputAdornmentProps) {
  return (
    <span className={cx('uikit-tf__adornment', `uikit-tf__adornment--${position}`, className)}>
      {children}
    </span>
  );
}
