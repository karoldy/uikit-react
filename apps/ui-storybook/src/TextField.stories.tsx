import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { InputAdornment, TextField } from '@uikit-react/text-field';
import '@uikit-react/text-field/styles.css';

const meta = {
  title: 'TextField',
  component: TextField,
  args: {
    label: 'Email',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/text-field` — MUI-compatible props, SCSS styles (`label`, `helperText`, `error`, `variant`, `size`, `slotProps`).',
      },
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof TextField>;

export const Basic: Story = {
  args: {
    helperText: "We'll never share it.",
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 280 }}>
      <TextField label="Outlined" variant="outlined" />
      <TextField label="Filled" variant="filled" />
      <TextField label="Standard" variant="standard" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 280 }}>
      <TextField label="Medium" size="medium" />
      <TextField label="Small" size="small" />
    </Stack>
  ),
};

export const Invalid: Story = {
  args: {
    error: true,
    helperText: 'Enter a valid email',
    defaultValue: 'not-an-email',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'disabled@example.com',
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: 'placeholder',
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ width: 280 }}>
        <TextField
          label="Email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          helperText={value ? `Value: ${value}` : 'Type to update'}
        />
      </Box>
    );
  },
};

export const Multiline: Story = {
  args: {
    label: 'Bio',
    multiline: true,
    minRows: 3,
    helperText: 'Height follows content when maxRows is omitted',
  },
};

export const MultilineMaxRows: Story = {
  args: {
    label: 'Bio',
    multiline: true,
    minRows: 2,
    maxRows: 4,
    helperText: 'Grows up to 4 rows, then scrolls',
  },
};

export const Adornments: Story = {
  render: () => (
    <Box sx={{ width: 280 }}>
      <TextField
        label="Amount"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          },
        }}
      />
    </Box>
  ),
};

export const EndAdornment: Story = {
  render: () => (
    <Box sx={{ width: 280 }}>
      <TextField
        label="Weight"
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
          },
        }}
      />
    </Box>
  ),
};

export const AutoFocus: Story = {
  args: {
    autoFocus: true,
    helperText: 'Mounted with autoFocus',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    defaultValue: 'Hello World',
    readOnly: true,
    helperText: 'Cannot edit',
  },
};
