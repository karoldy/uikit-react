import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateRangePicker, RangePicker } from '../src';

describe('DateRangePicker', () => {
  it('exports RangePicker as an alias of DateRangePicker', () => {
    expect(RangePicker).toBe(DateRangePicker);
  });

  it('is closed by default and shows the placeholder', () => {
    render(<DateRangePicker defaultMonth="2026-08" placeholder="Select range" />);

    expect(screen.getByRole('button', { name: 'Select range' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'August 10, 2026' })).not.toBeInTheDocument();
  });

  it('selects a range in two clicks and closes when complete', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker defaultMonth="2026-08" onChange={onChange} placeholder="Select range" />,
    );

    await user.click(screen.getByRole('button', { name: 'Select range' }));
    await user.click(screen.getByRole('button', { name: 'August 10, 2026' }));

    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-10', end: null });
    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-08-10 – …' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'August 15, 2026' }));

    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-10', end: '2026-08-15' });
    expect(screen.queryByRole('button', { name: 'August 15, 2026' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-08-10 – 2026-08-15' })).toBeInTheDocument();
  });

  it('keeps the popover open after the first click when closeOnSelect is true', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker defaultMonth="2026-08" placeholder="Select range" />);

    await user.click(screen.getByRole('button', { name: 'Select range' }));
    await user.click(screen.getByRole('button', { name: 'August 10, 2026' }));

    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toBeInTheDocument();
  });

  it('renders two month panels when numberOfMonths is 2', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        numberOfMonths={2}
        defaultMonth="2026-08"
        locale="en-US"
        placeholder="Select range"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select range' }));

    expect(screen.getByText('August 2026')).toBeInTheDocument();
    expect(screen.getByText('September 2026')).toBeInTheDocument();
  });

  it('selects a range across dual panels', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        numberOfMonths={2}
        defaultMonth="2026-08"
        onChange={onChange}
        placeholder="Select range"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select range' }));
    await user.click(screen.getByRole('button', { name: 'August 25, 2026' }));
    const septemberFifths = screen.getAllByRole('button', { name: 'September 5, 2026' });
    await user.click(septemberFifths[septemberFifths.length - 1]!);

    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-25', end: '2026-09-05' });
    expect(screen.getByRole('button', { name: '2026-08-25 – 2026-09-05' })).toBeInTheDocument();
  });
});
