import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '../src';

describe('Calendar', () => {
  it('renders the default calendar structure', () => {
    render(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'August 2026',
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('rowgroup')).toHaveLength(1);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getByRole('button', { name: 'July 27, 2026' })).toBeInTheDocument();
  });

  it('keeps selection unchanged until parent rerenders with new value in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <Calendar
        value="2026-08-10"
        defaultMonth="2026-08"
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    const previouslySelected = screen.getByRole('button', { name: 'August 10, 2026' });
    const nextDay = screen.getByRole('button', { name: 'August 15, 2026' });

    expect(previouslySelected).toHaveAttribute('aria-pressed', 'true');
    expect(nextDay).not.toHaveAttribute('aria-pressed');

    await user.click(nextDay);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(nextDay).not.toHaveAttribute('aria-pressed');
    expect(previouslySelected).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <Calendar
        value="2026-08-15"
        defaultMonth="2026-08"
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    expect(nextDay).toHaveAttribute('aria-pressed', 'true');
    expect(previouslySelected).not.toHaveAttribute('aria-pressed');
  });

  it('shows no selected day when controlled value is null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar value={null} defaultMonth="2026-08" onChange={onChange} disableDefaultStyles />,
    );

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    expect(day).not.toHaveAttribute('aria-pressed');

    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(day).not.toHaveAttribute('aria-pressed');
  });

  it('calls onChange with a YYYY-MM-DD date when a day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultMonth="2026-08" onChange={onChange} disableDefaultStyles />);

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(day).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not select dates outside inclusive min and max bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar
        defaultMonth="2026-08"
        min="2026-08-10"
        max="2026-08-20"
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    const beforeMin = screen.getByRole('button', { name: 'August 9, 2026' });
    const afterMax = screen.getByRole('button', { name: 'August 21, 2026' });
    expect(beforeMin).toBeDisabled();
    expect(afterMax).toBeDisabled();

    await user.click(beforeMin);
    await user.click(afterMax);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates the heading when moving to the next month', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'September 2026',
    );
  });

  it('renders day buttons through slots.day and slotProps.day', () => {
    const Day = (props: React.ComponentProps<'button'>) => (
      <button data-testid="custom-day" {...props} />
    );
    render(
      <Calendar
        defaultMonth="2026-08"
        slots={{ day: Day }}
        slotProps={{ day: { className: 'custom-day' } }}
        disableDefaultStyles
      />,
    );

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    expect(day).toHaveClass('custom-day');
    expect(day).toHaveAttribute('data-testid', 'custom-day');
  });

  it('preserves consumer day labels while enforcing button semantics', () => {
    render(
      <Calendar
        defaultMonth="2026-08"
        min="2026-08-10"
        slotProps={{ day: { 'aria-label': 'Choose date', type: 'submit' } }}
        disableDefaultStyles
      />,
    );

    const days = screen.getAllByRole('button', { name: 'Choose date' });
    expect(days[0]).toHaveAttribute('type', 'button');
    expect(days[0]).toBeDisabled();
  });

  it('does not pass an undefined type that clobbers a custom day slot default', () => {
    const Day = ({ type = 'button', ...props }: React.ComponentProps<'button'>) => (
      <button type={type} {...props} />
    );

    render(<Calendar defaultMonth="2026-08" slots={{ day: Day }} disableDefaultStyles />);

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

    render(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    expect(formatter).toHaveBeenCalledTimes(5);
    formatter.mockRestore();
  });

  it('switches to month view from heading and respects views whitelist', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        views={['month', 'day']}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Switch view from day' }));
    // month is coarsest when year is excluded from views → heading is not drillable
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aug' })).toBeInTheDocument();
  });

  it('renders Chinese weekday labels for zh-CN', () => {
    render(
      <Calendar defaultMonth="2026-08" locale="zh-CN" weekdayFormat="short" disableDefaultStyles />,
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers.some((node) => /一|周一|週一/.test(node.textContent ?? ''))).toBe(true);
  });

  it('does not put data-* state attributes on day buttons', () => {
    render(<Calendar defaultMonth="2026-08" defaultValue="2026-08-10" disableDefaultStyles />);
    const day = screen.getByRole('button', { name: 'August 10, 2026' });
    expect(day.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
  });

  it('updates the heading when moving to the previous month', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'July 2026',
    );
  });

  it('disables dates through isDateDisabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar
        defaultMonth="2026-08"
        isDateDisabled={(date) => date === '2026-08-15'}
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    const disabled = screen.getByRole('button', { name: 'August 15, 2026' });
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects a month from month view and returns to day view', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const onViewChange = vi.fn();
    render(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        onMonthChange={onMonthChange}
        onViewChange={onViewChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Switch view from day' }));
    await user.click(screen.getByRole('button', { name: 'Sep' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-09');
    expect(onViewChange).toHaveBeenCalledWith('month');
    expect(onViewChange).toHaveBeenCalledWith('day');
    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'September 2026',
    );
  });

  it('drills into year view, pages years, and selects a year', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        onMonthChange={onMonthChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Switch view from day' }));
    await user.click(screen.getByRole('button', { name: 'Switch view from month' }));

    expect(screen.getByRole('button', { name: '2026' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '2020' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next years' }));
    expect(screen.getByRole('button', { name: '2032' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '2020' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous years' }));
    await user.click(screen.getByRole('button', { name: '2024' }));

    expect(onMonthChange).toHaveBeenCalledWith('2024-08');
    expect(screen.getByRole('button', { name: 'Aug' })).toBeInTheDocument();
  });

  it('pages years in month view with previous/next year controls', async () => {
    const user = userEvent.setup();
    render(
      <Calendar defaultMonth="2026-08" locale="en-US" defaultView="month" disableDefaultStyles />,
    );

    expect(screen.getByRole('button', { name: 'Switch view from month' })).toHaveTextContent(
      '2026',
    );

    await user.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByRole('button', { name: 'Switch view from month' })).toHaveTextContent(
      '2027',
    );

    await user.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByRole('button', { name: 'Switch view from month' })).toHaveTextContent(
      '2026',
    );
  });

  it('respects controlled month and view', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const onViewChange = vi.fn();

    const { rerender } = render(
      <Calendar
        month="2026-08"
        view="day"
        locale="en-US"
        onMonthChange={onMonthChange}
        onViewChange={onViewChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onMonthChange).toHaveBeenCalledWith('2026-09');
    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'August 2026',
    );

    await user.click(screen.getByRole('button', { name: 'Switch view from day' }));
    expect(onViewChange).toHaveBeenCalledWith('month');
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);

    rerender(
      <Calendar
        month="2026-09"
        view="month"
        locale="en-US"
        onMonthChange={onMonthChange}
        onViewChange={onViewChange}
        disableDefaultStyles
      />,
    );

    expect(screen.getByRole('button', { name: 'Switch view from month' })).toHaveTextContent(
      '2026',
    );
    expect(screen.getByRole('button', { name: 'Sep' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies default root class and custom animation class names', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        animationClassNames={{ up: 'slide-up' }}
        animationDuration={50}
      />,
    );

    expect(container.firstChild).toHaveClass('uikit-cal');
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(container.querySelector('.slide-up')).toBeTruthy();
  });

  it('does not apply animation classes when animated is false', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        animated={false}
        animationClassNames={{ up: 'slide-up' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(container.querySelector('.slide-up')).toBeNull();
  });
});
