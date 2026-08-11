import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as DatePickerPackage from '../src';
import { DatePicker } from '../src';

describe('DatePicker', () => {
  it('exports only the DatePicker package surface', () => {
    expect(DatePickerPackage).not.toHaveProperty('Calendar');
  });

  it('is closed by default and shows the placeholder on its trigger', () => {
    render(<DatePicker defaultMonth="2026-08" placeholder="Choose a date" />);

    expect(screen.getByRole('button', { name: 'Choose a date' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'August 15, 2026' })).not.toBeInTheDocument();
  });

  it('opens the calendar when its trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultMonth="2026-08" placeholder="Choose a date" />);

    await user.click(screen.getByRole('button', { name: 'Choose a date' }));

    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toBeInTheDocument();
  });

  it('selects a day and closes by default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultMonth="2026-08"
        defaultValue={null}
        onChange={onChange}
        placeholder="Choose a date"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Choose a date' }));
    await user.click(screen.getByRole('button', { name: 'August 15, 2026' }));

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(screen.getByRole('button', { name: '2026-08-15' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'August 15, 2026' })).not.toBeInTheDocument();
  });

  it('supports a custom trigger through asChild', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker asChild defaultMonth="2026-08">
        <button type="button">Custom trigger</button>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Custom trigger' }));

    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toBeInTheDocument();
  });
});
