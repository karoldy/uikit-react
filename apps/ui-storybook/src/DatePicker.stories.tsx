import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import {
  DatePicker,
  DateRangePicker,
  RangePicker,
  type CalendarDateRange,
} from '@uikit-react/date-picker';
import '@uikit-react/calendar-base/styles.css';

const meta = {
  title: 'DatePicker',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/date-picker` — DatePicker + DateRangePicker / RangePicker.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

function formatRange(range: CalendarDateRange | null) {
  if (!range) {
    return '(none)';
  }
  return `${range.start} → ${range.end ?? '…'}`;
}

export const DatePickerBasic: Story = {
  render: () => (
    <DatePicker asChild placeholder="Select date">
      <Button variant="contained">Select date</Button>
    </DatePicker>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <DatePicker min="2026-08-01" max="2026-08-31" defaultMonth="2026-08" asChild>
      <Button variant="outlined">August 2026 only</Button>
    </DatePicker>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string | null>('2026-08-10');
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">value: {value ?? '(none)'}</Typography>
        <DatePicker value={value} onChange={setValue} defaultMonth="2026-08" asChild>
          <Button variant="contained" color="secondary">
            {value ?? 'Select date'}
          </Button>
        </DatePicker>
      </Stack>
    );
  },
};

export const RangeBasic: Story = {
  name: 'RangePicker / single panel',
  render: () => (
    <DateRangePicker defaultMonth="2026-08" placeholder="Select range" asChild>
      <Button variant="contained">Select range</Button>
    </DateRangePicker>
  ),
};

export const RangeDualPanel: Story = {
  name: 'RangePicker / dual panel',
  render: () => (
    <RangePicker numberOfMonths={2} defaultMonth="2026-08" placeholder="Select range" asChild>
      <Button variant="outlined">Select range (2 months)</Button>
    </RangePicker>
  ),
};

export const RangeControlled: Story = {
  name: 'RangePicker / controlled',
  render: function RangeControlledStory() {
    const [value, setValue] = useState<CalendarDateRange | null>({
      start: '2026-08-10',
      end: '2026-08-15',
    });

    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">value: {formatRange(value)}</Typography>
        <DateRangePicker
          numberOfMonths={2}
          value={value}
          onChange={setValue}
          defaultMonth="2026-08"
          asChild
        >
          <Button variant="contained" color="secondary">
            {formatRange(value)}
          </Button>
        </DateRangePicker>
        <Button size="small" onClick={() => setValue(null)}>
          Clear
        </Button>
      </Stack>
    );
  },
};
