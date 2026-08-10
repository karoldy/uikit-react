import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { Calendar } from '@uikit-react/calendar-base';

const calendarStyles = `
  [data-calendar] {
    display: inline-block;
    font-family: system-ui, sans-serif;
  }
  [data-calendar] [data-calendar-header] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  [data-calendar] [data-calendar-header] h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  [data-calendar] [role="row"] {
    display: grid;
    grid-template-columns: repeat(7, 2.25rem);
    gap: 2px;
  }
  [data-calendar] [role="columnheader"] {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.7;
    line-height: 2.25rem;
  }
  [data-calendar] button {
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
  }
  [data-calendar] button:hover:not([data-disabled]) {
    background: rgba(25, 118, 210, 0.08);
  }
  [data-selected] { background: #1976d2; color: #fff; }
  [data-today] { outline: 2px solid #1976d2; }
  [data-outside-month] { opacity: 0.35; }
  [data-disabled] { opacity: 0.3; cursor: not-allowed; }
`;

const meta = {
  title: 'Calendar',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/calendar-base` — unstyled calendar compounds with `data-*` hooks.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <>
      <style>{calendarStyles}</style>
      <Calendar data-calendar defaultValue="2026-08-10" defaultMonth="2026-08" />
    </>
  ),
};

export const Compounds: Story = {
  name: 'Compounds',
  render: () => (
    <>
      <style>{calendarStyles}</style>
      <Calendar.Root data-calendar defaultValue="2026-08-10" defaultMonth="2026-08">
        <Calendar.Header data-calendar-header>
          <Calendar.PrevMonth>{'‹'}</Calendar.PrevMonth>
          <Calendar.Heading />
          <Calendar.NextMonth>{'›'}</Calendar.NextMonth>
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.WeekDays />
          <Calendar.Days />
        </Calendar.Grid>
      </Calendar.Root>
    </>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <>
      <style>{calendarStyles}</style>
      <Calendar
        data-calendar
        defaultMonth="2026-08"
        min="2026-08-05"
        max="2026-08-25"
        defaultValue="2026-08-10"
      />
    </>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string | null>('2026-08-10');
    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <style>{calendarStyles}</style>
        <Typography variant="body2">value: {value ?? '(none)'}</Typography>
        <Calendar data-calendar value={value} onChange={setValue} defaultMonth="2026-08" />
      </Stack>
    );
  },
};

export const CustomDaySlot: Story = {
  render: () => (
    <>
      <style>{`
        ${calendarStyles}
        [data-calendar] [role="gridcell"] > span {
          display: inline-flex;
          width: 2.25rem;
          height: 2.25rem;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          cursor: pointer;
        }
        [data-calendar] [role="gridcell"] > span[data-selected] {
          background: #2e7d32;
          color: #fff;
        }
      `}</style>
      <Calendar.Root
        data-calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-15"
        slots={{ day: 'span' }}
        slotProps={{ day: { className: 'day-chip' } }}
      >
        <Calendar.Header data-calendar-header>
          <Calendar.PrevMonth />
          <Calendar.Heading />
          <Calendar.NextMonth />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.WeekDays />
          <Calendar.Days />
        </Calendar.Grid>
      </Calendar.Root>
    </>
  ),
};

export const WeekStartsOnSunday: Story = {
  render: () => (
    <>
      <style>{calendarStyles}</style>
      <Calendar data-calendar defaultMonth="2026-08" defaultValue="2026-08-10" weekStartsOn={0} />
    </>
  ),
};
