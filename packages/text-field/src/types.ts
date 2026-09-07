import type {
  ChangeEvent,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
} from 'react';

export type TextFieldVariant = 'outlined' | 'filled' | 'standard';
export type TextFieldSize = 'medium' | 'small';
export type TextFieldColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export interface TextFieldInputSlotProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
  readOnly?: boolean;
}

export interface TextFieldSlotProps {
  input?: TextFieldInputSlotProps;
  htmlInput?: InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export interface TextFieldProps {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  color?: TextFieldColor;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>;
  className?: string;
  style?: CSSProperties;
  slotProps?: TextFieldSlotProps;
}

export interface InputAdornmentProps {
  position: 'start' | 'end';
  children?: ReactNode;
  className?: string;
}
