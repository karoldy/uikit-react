import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type * as React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Popover } from '@uikit-react/popover';

const meta = {
  title: 'Popover',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/popover` — Floating UI based popover, demonstrated with MUI triggers.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="contained">Open popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Paper sx={{ p: 2, minWidth: 220 }} elevation={3}>
          <Typography variant="subtitle1" gutterBottom>
            Basic
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Click outside or press Esc to dismiss.
          </Typography>
          <Popover.Close asChild>
            <Button size="small">Close</Button>
          </Popover.Close>
        </Paper>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <Popover.Root arrow placement="bottom">
      <Popover.Trigger asChild>
        <Button variant="outlined">With arrow</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Paper
          sx={{ p: 2, minWidth: 200, bgcolor: 'background.paper', position: 'relative' }}
          elevation={3}
        >
          <Typography variant="body2">Arrow enabled via `arrow` on Root.</Typography>
        </Paper>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const Placements: Story = {
  render: () => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Popover.Root key={placement} placement={placement}>
          <Popover.Trigger asChild>
            <Button variant="text">{placement}</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Paper sx={{ p: 1.5 }} elevation={3}>
              <Typography variant="caption">placement=&quot;{placement}&quot;</Typography>
            </Paper>
          </Popover.Content>
        </Popover.Root>
      ))}
    </Stack>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">open: {String(open)}</Typography>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button variant="contained" color="secondary">
              Controlled
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <Paper sx={{ p: 2, minWidth: 200 }} elevation={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                State is controlled by the parent.
              </Typography>
              <Button size="small" onClick={() => setOpen(false)}>
                Close from outside Close slot
              </Button>
            </Paper>
          </Popover.Content>
        </Popover.Root>
      </Stack>
    );
  },
};

function Panel({
  title,
  children,
  ...rest
}: {
  title: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Box
      component="section"
      {...rest}
      sx={{
        p: 2,
        minWidth: 240,
        borderRadius: 2,
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        boxShadow: 6,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export const CustomRootSlot: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="contained">Custom slots.root</Button>
      </Popover.Trigger>
      <Popover.Content slots={{ root: Panel }} slotProps={{ root: { title: 'Slot panel' } }}>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Root node replaced via slots API.
        </Typography>
        <Popover.Close asChild>
          <Button size="small" variant="outlined" color="inherit">
            Close
          </Button>
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const RenderProps: Story = {
  render: () => (
    <Popover placement="bottom-start">
      {(api) => (
        <>
          <Button variant="contained" {...api.getTriggerProps()}>
            Render props API
          </Button>
          {api.open ? (
            <Paper {...api.getContentProps()} sx={{ p: 2 }} elevation={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Built with the render-props `Popover` API.
              </Typography>
              <Button size="small" {...api.getCloseProps()}>
                Close
              </Button>
            </Paper>
          ) : null}
        </>
      )}
    </Popover>
  ),
};
