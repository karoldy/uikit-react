import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { cx } from './cx';
import { syncTextareaHeight } from './sync-textarea-height';
import type { TextFieldProps } from './types';

const COLOR_VARS: Record<NonNullable<TextFieldProps['color']>, string> = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  error: '#d32f2f',
  info: '#0288d1',
  success: '#2e7d32',
  warning: '#ed6c02',
};

function isEmpty(value: string | number | undefined) {
  return value === undefined || value === '';
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

export function TextField({
  label,
  helperText,
  error = false,
  disabled = false,
  required = false,
  fullWidth = false,
  variant = 'outlined',
  size = 'medium',
  color = 'primary',
  multiline = false,
  rows,
  minRows,
  maxRows,
  value,
  defaultValue,
  onChange,
  name,
  id: idProp,
  placeholder,
  type = 'text',
  autoComplete,
  autoFocus,
  readOnly = false,
  inputRef,
  className,
  style,
  slotProps,
}: TextFieldProps) {
  const uid = useId();
  const inputId = idProp ?? `uikit-tf-${uid}`;
  const helperId = `${inputId}-helper`;
  const controlled = value !== undefined;
  const [uncontrolledEmpty, setUncontrolledEmpty] = useState(isEmpty(defaultValue));
  const [focused, setFocused] = useState(Boolean(autoFocus));

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autosize = multiline && rows === undefined;
  const min = minRows ?? 1;

  const empty = controlled ? isEmpty(value) : uncontrolledEmpty;
  const startAdornment = slotProps?.input?.startAdornment;
  const endAdornment = slotProps?.input?.endAdornment;
  const shrunk =
    Boolean(label) && (focused || !empty || Boolean(startAdornment) || Boolean(placeholder));
  const accent = error ? COLOR_VARS.error : COLOR_VARS[color];
  const htmlInput = slotProps?.htmlInput;
  const isReadOnly =
    readOnly || Boolean(slotProps?.input?.readOnly) || Boolean(htmlInput?.readOnly);
  const describedBy = helperText ? helperId : undefined;
  const inputPlaceholder = placeholder ?? ' ';
  const valueProps = controlled ? { value } : { defaultValue };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!controlled) {
      setUncontrolledEmpty(event.target.value === '');
    }
    if (autosize && event.target instanceof HTMLTextAreaElement) {
      syncTextareaHeight(event.target, min, maxRows);
    }
    onChange?.(event);
    htmlInput?.onChange?.(event as never);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(true);
    htmlInput?.onFocus?.(event as never);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(false);
    htmlInput?.onBlur?.(event as never);
  };

  const controlProps = {
    ...htmlInput,
    id: inputId,
    name,
    disabled,
    required,
    autoComplete,
    autoFocus,
    readOnly: isReadOnly,
    'aria-invalid': error || undefined,
    'aria-describedby': describedBy,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange,
    ref: (autosize ? composeRefs(textareaRef, inputRef) : inputRef) as never,
  };

  useLayoutEffect(() => {
    if (!autosize) return;
    const el = textareaRef.current;
    if (!el) return;
    const sync = () => syncTextareaHeight(el, min, maxRows);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [autosize, min, maxRows, value]);

  let control: ReactElement;
  if (multiline) {
    control = (
      <textarea
        {...controlProps}
        {...valueProps}
        rows={autosize ? min : (rows ?? minRows)}
        placeholder={inputPlaceholder}
        className={cx('uikit-tf__control', 'uikit-tf__control--textarea', htmlInput?.className)}
      />
    );
  } else {
    control = (
      <input
        {...controlProps}
        {...valueProps}
        type={type}
        placeholder={inputPlaceholder}
        className={cx('uikit-tf__control', htmlInput?.className)}
      />
    );
  }

  return (
    <div
      style={{ ...style, ['--uikit-tf-accent' as string]: accent }}
      className={cx(
        'uikit-tf',
        `uikit-tf--${variant}`,
        `uikit-tf--size-${size}`,
        fullWidth && 'uikit-tf--full-width',
        disabled && 'uikit-tf--disabled',
        error && 'uikit-tf--error',
        focused && 'uikit-tf--focused',
        shrunk && 'uikit-tf--shrunk',
        className,
      )}
    >
      {label ? (
        <label className="uikit-tf__label" htmlFor={inputId}>
          {label}
          {required ? <span className="uikit-tf__asterisk"> *</span> : null}
        </label>
      ) : null}
      <div className={cx('uikit-tf__field', slotProps?.input?.className)}>
        {startAdornment}
        {control}
        {endAdornment}
        {variant === 'outlined' ? (
          <fieldset className="uikit-tf__notch" aria-hidden="true">
            <legend className="uikit-tf__legend">
              {label ? (
                <span>
                  {label}
                  {required ? ' *' : ''}
                </span>
              ) : (
                <span>&nbsp;</span>
              )}
            </legend>
          </fieldset>
        ) : null}
      </div>
      {helperText ? (
        <p className="uikit-tf__helper" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
