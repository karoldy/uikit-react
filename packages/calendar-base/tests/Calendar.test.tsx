import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { Calendar, type CalendarDaySlotProps, type CalendarProps } from '../src';
import { testSlots } from './test-slots';

function renderCalendar(ui: ReactElement<CalendarProps>) {
  const merge = (el: ReactElement<CalendarProps>) => (
    <Calendar {...el.props} slots={{ ...testSlots, ...el.props.slots }} />
  );
  const result = render(merge(ui));
  return {
    ...result,
    rerender: (next: ReactElement<CalendarProps>) => result.rerender(merge(next)),
  };
}

describe('Calendar', () => {
  it('renders the default calendar structure', () => {
    renderCalendar(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'August 2026',
    );
    expect(screen.getByRole('button', { name: 'July 27, 2026' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('button')
        .filter((node) => /^\w+ \d+, \d+$/.test(node.getAttribute('aria-label') ?? '')),
    ).toHaveLength(42);
  });

  it('hides outside-month day buttons when showOutsideDays is false', () => {
    renderCalendar(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        showOutsideDays={false}
        disableDefaultStyles
      />,
    );

    expect(screen.queryByRole('button', { name: 'July 27, 2026' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'September 6, 2026' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'August 1, 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'August 31, 2026' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('button')
        .filter((node) => /^\w+ \d+, \d+$/.test(node.getAttribute('aria-label') ?? '')),
    ).toHaveLength(31);
  });

  it('keeps selection unchanged until parent rerenders with new value in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = renderCalendar(
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

    renderCalendar(
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
    renderCalendar(<Calendar defaultMonth="2026-08" onChange={onChange} disableDefaultStyles />);

    const day = screen.getByRole('button', { name: 'August 15, 2026' });
    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-08-15');
    expect(day).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not select dates outside inclusive min and max bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
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
    renderCalendar(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'September 2026',
    );
  });

  it('renders day buttons through slots.day and slotProps.day', () => {
    const Day = ({
      label,
      date: _date,
      selected: _selected,
      today: _today,
      outside: _outside,
      rangeStart: _rangeStart,
      rangeEnd: _rangeEnd,
      inRange: _inRange,
      preview: _preview,
      ...props
    }: CalendarDaySlotProps) => <button data-testid="custom-day" aria-label={label} {...props} />;
    renderCalendar(
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

  it('passes explicit day state props to custom slots.day', () => {
    const seen: Array<
      Pick<CalendarDaySlotProps, 'date' | 'selected' | 'outside' | 'today' | 'label'>
    > = [];
    const Day = ({
      label,
      date,
      selected,
      today,
      outside,
      rangeStart: _rangeStart,
      rangeEnd: _rangeEnd,
      inRange: _inRange,
      preview: _preview,
      ...props
    }: CalendarDaySlotProps) => {
      seen.push({ label, date, selected, today, outside });
      return <button aria-label={label} {...props} />;
    };

    renderCalendar(
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        locale="en-US"
        slots={{ day: Day }}
        disableDefaultStyles
      />,
    );

    expect(seen).toContainEqual({
      label: 'August 10, 2026',
      date: '2026-08-10',
      selected: true,
      today: false,
      outside: false,
    });
    expect(seen).toContainEqual({
      label: 'July 27, 2026',
      date: '2026-07-27',
      selected: false,
      today: false,
      outside: true,
    });
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
    const Day = ({
      type = 'button',
      label,
      date: _date,
      selected: _selected,
      today: _today,
      outside: _outside,
      rangeStart: _rangeStart,
      rangeEnd: _rangeEnd,
      inRange: _inRange,
      preview: _preview,
      ...props
    }: CalendarDaySlotProps) => <button type={type} aria-label={label} {...props} />;

    renderCalendar(<Calendar defaultMonth="2026-08" slots={{ day: Day }} disableDefaultStyles />);

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

    renderCalendar(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    expect(formatter).toHaveBeenCalledTimes(5);
    formatter.mockRestore();
  });

  it('switches to month view from heading and respects views whitelist', async () => {
    const user = userEvent.setup();
    renderCalendar(
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
    const { container } = renderCalendar(
      <Calendar defaultMonth="2026-08" locale="zh-CN" weekdayFormat="short" disableDefaultStyles />,
    );
    expect(/一|周一|週一/.test(container.textContent ?? '')).toBe(true);
  });

  it('does not set aria-* or data-* state attributes on default (unstyled) day buttons', () => {
    render(<Calendar defaultMonth="2026-08" defaultValue="2026-08-10" disableDefaultStyles />);
    const day = screen.getAllByRole('button').find((node) => node.textContent === '10');
    expect(day).toBeTruthy();
    expect(
      day!
        .getAttributeNames()
        .filter((name) => name.startsWith('aria-') || name.startsWith('data-')),
    ).toEqual([]);
  });

  it('updates the heading when moving to the previous month', async () => {
    const user = userEvent.setup();
    renderCalendar(<Calendar defaultMonth="2026-08" locale="en-US" disableDefaultStyles />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(screen.getByRole('button', { name: 'Switch view from day' })).toHaveTextContent(
      'July 2026',
    );
  });

  it('disables dates through isDateDisabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
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

  it('disables weekends through dayOf', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
      <Calendar
        defaultMonth="2026-08"
        locale="en-US"
        dayOf={({ isWeekend }) => ({ disabled: isWeekend })}
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    // 2026-08-15 is Saturday
    const saturday = screen.getByRole('button', { name: 'August 15, 2026' });
    const monday = screen.getByRole('button', { name: 'August 10, 2026' });
    expect(saturday).toBeDisabled();
    expect(monday).not.toBeDisabled();

    await user.click(saturday);
    expect(onChange).not.toHaveBeenCalled();
    await user.click(monday);
    expect(onChange).toHaveBeenCalledWith('2026-08-10');
  });

  it('merges dayOf className and holiday disabled overrides', () => {
    const holidays = new Set(['2026-08-12']);
    renderCalendar(
      <Calendar
        defaultMonth="2026-08"
        dayOf={({ date, isWeekend }) => ({
          disabled: isWeekend || holidays.has(date),
          className: holidays.has(date) ? 'is-holiday' : isWeekend ? 'is-weekend' : undefined,
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'August 12, 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'August 12, 2026' })).toHaveClass('is-holiday');
    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toHaveClass('is-weekend');
    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toBeDisabled();
  });

  it('selects a month from month view and returns to day view', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const onViewChange = vi.fn();
    renderCalendar(
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
    renderCalendar(
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
    renderCalendar(
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

    const { rerender } = renderCalendar(
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
    // view is controlled — still day until parent updates
    expect(
      screen
        .getAllByRole('button')
        .filter((node) => /^\w+ \d+, \d+$/.test(node.getAttribute('aria-label') ?? '')),
    ).toHaveLength(42);

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
    const { container } = renderCalendar(
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
    const { container } = renderCalendar(
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

  it('selects a date range in two clicks and marks in-range days', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(<Calendar selectionMode="range" defaultMonth="2026-08" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'August 10, 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-10', end: null });
    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toHaveClass(
      'uikit-cal__day--range-start',
    );

    await user.click(screen.getByRole('button', { name: 'August 15, 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-10', end: '2026-08-15' });

    expect(screen.getByRole('button', { name: 'August 12, 2026' })).toHaveClass(
      'uikit-cal__day--in-range',
    );
    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toHaveClass(
      'uikit-cal__day--range-start',
    );
    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toHaveClass(
      'uikit-cal__day--range-end',
    );
  });

  it('previews the hovered range before the second click', async () => {
    const user = userEvent.setup();
    renderCalendar(<Calendar selectionMode="range" defaultMonth="2026-08" />);

    await user.click(screen.getByRole('button', { name: 'August 10, 2026' }));
    await user.hover(screen.getByRole('button', { name: 'August 15, 2026' }));

    expect(screen.getByRole('button', { name: 'August 12, 2026' })).toHaveClass(
      'uikit-cal__day--in-range',
      'uikit-cal__day--preview',
    );
    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toHaveClass(
      'uikit-cal__day--range-end',
      'uikit-cal__day--preview',
    );
    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toHaveClass(
      'uikit-cal__day--range-start',
    );
  });

  it('previews inverted hover before the anchor start', async () => {
    const user = userEvent.setup();
    renderCalendar(<Calendar selectionMode="range" defaultMonth="2026-08" />);

    await user.click(screen.getByRole('button', { name: 'August 15, 2026' }));
    await user.hover(screen.getByRole('button', { name: 'August 10, 2026' }));

    expect(screen.getByRole('button', { name: 'August 10, 2026' })).toHaveClass(
      'uikit-cal__day--range-start',
      'uikit-cal__day--preview',
    );
    expect(screen.getByRole('button', { name: 'August 15, 2026' })).toHaveClass(
      'uikit-cal__day--range-end',
      'uikit-cal__day--preview',
    );
    expect(screen.getByRole('button', { name: 'August 12, 2026' })).toHaveClass(
      'uikit-cal__day--preview',
    );
  });

  it('does not preview hover when the range is already complete', async () => {
    const user = userEvent.setup();
    renderCalendar(
      <Calendar
        selectionMode="range"
        defaultMonth="2026-08"
        defaultValue={{ start: '2026-08-10', end: '2026-08-12' }}
      />,
    );

    await user.hover(screen.getByRole('button', { name: 'August 20, 2026' }));

    expect(screen.getByRole('button', { name: 'August 20, 2026' })).not.toHaveClass(
      'uikit-cal__day--preview',
      'uikit-cal__day--in-range',
    );
    expect(screen.getByRole('button', { name: 'August 11, 2026' })).toHaveClass(
      'uikit-cal__day--in-range',
    );
    expect(screen.getByRole('button', { name: 'August 11, 2026' })).not.toHaveClass(
      'uikit-cal__day--preview',
    );
  });

  it('swaps inverted range ends on the second click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
      <Calendar
        selectionMode="range"
        defaultMonth="2026-08"
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'August 15, 2026' }));
    await user.click(screen.getByRole('button', { name: 'August 10, 2026' }));

    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-10', end: '2026-08-15' });
  });

  it('restarts range selection after a complete range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
      <Calendar
        selectionMode="range"
        defaultMonth="2026-08"
        defaultValue={{ start: '2026-08-10', end: '2026-08-15' }}
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'August 20, 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-20', end: null });
  });

  it('renders two month panels when numberOfMonths is 2', () => {
    renderCalendar(
      <Calendar numberOfMonths={2} defaultMonth="2026-08" locale="en-US" disableDefaultStyles />,
    );

    expect(screen.getByText('August 2026')).toBeInTheDocument();
    expect(screen.getByText('September 2026')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('button')
        .filter((node) => /^\w+ \d+, \d+$/.test(node.getAttribute('aria-label') ?? '')),
    ).toHaveLength(84);
  });

  it('shifts both panels when navigating to the next month', async () => {
    const user = userEvent.setup();
    renderCalendar(
      <Calendar numberOfMonths={2} defaultMonth="2026-08" locale="en-US" disableDefaultStyles />,
    );

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByText('September 2026')).toBeInTheDocument();
    expect(screen.getByText('October 2026')).toBeInTheDocument();
    expect(screen.queryByText('August 2026')).not.toBeInTheDocument();
  });

  it('selects a range across adjacent month panels', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCalendar(
      <Calendar
        selectionMode="range"
        numberOfMonths={2}
        defaultMonth="2026-08"
        onChange={onChange}
        disableDefaultStyles
      />,
    );

    await user.click(screen.getByRole('button', { name: 'August 25, 2026' }));
    // September 5 also appears as an outside day in the August panel — prefer the later panel.
    const septemberFifths = screen.getAllByRole('button', { name: 'September 5, 2026' });
    await user.click(septemberFifths[septemberFifths.length - 1]!);

    expect(onChange).toHaveBeenLastCalledWith({ start: '2026-08-25', end: '2026-09-05' });
  });
});
