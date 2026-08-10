import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '../src';

describe('Calendar', () => {
  it('renders the default calendar structure', () => {
    render(<Calendar defaultMonth="2026-08" locale="en-US" />);

    expect(screen.getByRole('heading', { name: 'August 2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('rowgroup')).toHaveLength(1);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getByRole('button', { name: 'July 27, 2026' })).toHaveAttribute(
      'data-outside-month',
    );
  });

  it('keeps selection unchanged until parent rerenders with new value in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <Calendar value="2026-08-10" defaultMonth="2026-08" onChange={onChange} />,
    );

    const previouslySelected = screen.getByRole('button', { name: 'August 10, 2026' });
    const nextDay = screen.getByRole('button', { name: 'August 15, 2026' });

    expect(previouslySelected).toHaveAttribute('data-selected');
    expect(nextDay).not.toHaveAttribute('data-selected');

    await user.click(nextDay);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(nextDay).not.toHaveAttribute('data-selected');
    expect(previouslySelected).toHaveAttribute('data-selected');

    rerender(<Calendar value="2026-08-15" defaultMonth="2026-08" onChange={onChange} />);

    expect(nextDay).toHaveAttribute('data-selected');
    expect(previouslySelected).not.toHaveAttribute('data-selected');
  });

  it('shows no selected day when controlled value is null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Calendar value={null} defaultMonth="2026-08" onChange={onChange} />);

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    expect(day).not.toHaveAttribute('data-selected');

    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(day).not.toHaveAttribute('data-selected');
  });

  it('calls onChange with a YYYY-MM-DD date when a day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultMonth="2026-08" onChange={onChange} />);

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(day).toHaveAttribute('data-selected');
  });

  it('does not select dates outside inclusive min and max bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar defaultMonth="2026-08" min="2026-08-10" max="2026-08-20" onChange={onChange} />,
    );

    const beforeMin = screen.getByRole('button', { name: 'August 9, 2026' });
    const afterMax = screen.getByRole('button', { name: 'August 21, 2026' });
    expect(beforeMin).toBeDisabled();
    expect(afterMax).toBeDisabled();
    expect(beforeMin).toHaveAttribute('data-disabled');
    expect(afterMax).toHaveAttribute('data-disabled');

    await user.click(beforeMin);
    await user.click(afterMax);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates the heading when moving to the next month', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultMonth="2026-08" locale="en-US" />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByRole('heading', { name: 'September 2026' })).toBeInTheDocument();
  });

  it('renders day buttons through slots.day and slotProps.day', () => {
    const Day = (props: React.ComponentProps<'button'>) => <button data-slot="day" {...props} />;
    render(
      <Calendar
        defaultMonth="2026-08"
        slots={{ day: Day }}
        slotProps={{ day: { className: 'custom-day' } }}
      />,
    );

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    expect(day).toHaveClass('custom-day');
    expect(day).toHaveAttribute('data-slot', 'day');
  });

  it('preserves consumer day labels while enforcing button semantics', () => {
    render(
      <Calendar
        defaultMonth="2026-08"
        min="2026-08-10"
        slotProps={{ day: { 'aria-label': 'Choose date', type: 'submit' } }}
      />,
    );

    const days = screen.getAllByRole('button', { name: 'Choose date' });
    expect(days[0]).toHaveAttribute('type', 'button');
    expect(days[0]).toBeDisabled();
    expect(days[0]).toHaveAttribute('data-disabled');
  });

  it('does not pass an undefined type that clobbers a custom day slot default', () => {
    const Day = ({ type = 'button', ...props }: React.ComponentProps<'button'>) => (
      <button type={type} {...props} />
    );

    render(<Calendar defaultMonth="2026-08" slots={{ day: Day }} />);

    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('reuses date-time formatters across all day cells', () => {
    const DateTimeFormat = Intl.DateTimeFormat;
    const formatter = vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (
      ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
    ) {
      return new DateTimeFormat(...args);
    });

    render(<Calendar defaultMonth="2026-08" locale="en-US" />);

    expect(formatter).toHaveBeenCalledTimes(3);
    formatter.mockRestore();
  });
});
