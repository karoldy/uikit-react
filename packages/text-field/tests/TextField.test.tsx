import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InputAdornment, TextField } from '../src';

describe('TextField', () => {
  it('associates label with the textbox like MUI', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders helperText', () => {
    render(<TextField label="Email" helperText="We'll never share it." />);
    expect(screen.getByText("We'll never share it.")).toBeInTheDocument();
  });

  it('sets aria-invalid when error is true', () => {
    render(<TextField label="Email" error helperText="Enter a valid email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('disables the input when disabled', () => {
    render(<TextField label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('marks required on the input', () => {
    render(<TextField label="Email" required />);
    expect(screen.getByLabelText(/Email/)).toBeRequired();
  });

  it('uses outlined variant by default', () => {
    const { container } = render(<TextField label="Email" />);
    expect(container.querySelector('.uikit-tf--outlined')).not.toBeNull();
    expect(container.querySelector('.uikit-tf')).not.toBeNull();
  });

  it('renders filled and standard variants', () => {
    const { rerender, container } = render(<TextField label="Email" variant="filled" />);
    expect(container.querySelector('.uikit-tf--filled')).not.toBeNull();
    rerender(<TextField label="Email" variant="standard" />);
    expect(container.querySelector('.uikit-tf--standard')).not.toBeNull();
  });

  it('applies small size class', () => {
    const { container } = render(<TextField label="Email" size="small" />);
    expect(container.querySelector('.uikit-tf--size-small')).not.toBeNull();
  });

  it('fires onChange when typing (controlled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <TextField
          label="Email"
          value={value}
          onChange={(event) => {
            onChange(event);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.type(screen.getByLabelText('Email'), 'a');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe('a');
    expect(screen.getByLabelText('Email')).toHaveValue('a');
  });

  it('renders startAdornment via slotProps.input', () => {
    render(
      <TextField
        label="Amount"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          },
        }}
      />,
    );
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders a textarea when multiline', () => {
    render(<TextField label="Bio" multiline />);
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA');
  });

  it('applies minRows on a multiline textarea', () => {
    render(<TextField label="Bio" multiline minRows={3} />);
    expect(screen.getByLabelText('Bio')).toHaveAttribute('rows', '3');
  });

  it('keeps overflow hidden when multiline has no maxRows', () => {
    render(<TextField label="Bio" multiline minRows={2} />);
    expect((screen.getByLabelText('Bio') as HTMLTextAreaElement).style.overflowY).toBe('hidden');
  });

  it('uses a fixed rows attribute when rows is set', () => {
    render(<TextField label="Bio" multiline rows={5} minRows={2} />);
    expect(screen.getByLabelText('Bio')).toHaveAttribute('rows', '5');
  });

  it('adds focused class on focus so the outline can use the accent color', async () => {
    const user = userEvent.setup();
    const { container } = render(<TextField label="Email" />);
    await user.click(screen.getByLabelText('Email'));
    expect(container.querySelector('.uikit-tf')).toHaveClass('uikit-tf--focused');
  });

  it('autoFocus focuses the input on mount', () => {
    render(<TextField label="Email" autoFocus />);
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(screen.getByLabelText('Email').closest('.uikit-tf')).toHaveClass('uikit-tf--focused');
  });

  it('marks the input readOnly', () => {
    render(<TextField label="Email" defaultValue="Hello World" readOnly />);
    expect(screen.getByLabelText('Email')).toHaveProperty('readOnly', true);
  });
});
