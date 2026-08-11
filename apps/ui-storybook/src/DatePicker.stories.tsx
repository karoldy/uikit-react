import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { DatePicker } from '@uikit-react/date-picker';
import '@uikit-react/calendar-base/styles.css';

const meta = {
  title: 'DatePicker',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/date-picker` — popover DatePicker composing `@uikit-react/calendar-base`.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

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
