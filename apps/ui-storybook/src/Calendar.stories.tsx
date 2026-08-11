import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Calendar } from '@uikit-react/calendar-base';
import '@uikit-react/calendar-base/styles.css';

const meta = {
  title: 'Calendar',
  parameters: {
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/calendar-base` — demonstrated with MUI Paper / Button / IconButton slots.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

function StoryFrame({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      {title ? (
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
      ) : null}
      <Paper variant="outlined" sx={{ p: 2, display: 'inline-block' }}>
        {children}
      </Paper>
    </Stack>
  );
}

function MuiRoot({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Paper elevation={2} className={className} style={style} sx={{ p: 2, display: 'inline-block' }}>
      {children}
    </Paper>
  );
}

function MuiHeader({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        mb: 1,
        px: 0.5,
      }}
    >
      {children}
    </Box>
  );
}

function MuiPrev({
  onClick,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
  children,
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={ariaLabel}
    >
      {children ?? '‹'}
    </IconButton>
  );
}

function MuiNext({
  onClick,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
  children,
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={ariaLabel}
    >
      {children ?? '›'}
    </IconButton>
  );
}

function MuiHeading({
  children,
  onClick,
  className,
  style,
  type,
  'aria-label': ariaLabel,
}: ButtonHTMLAttributes<HTMLButtonElement> & HTMLAttributes<HTMLElement>) {
  if (type === 'button' || onClick) {
    return (
      <Button
        size="small"
        color="inherit"
        type="button"
        onClick={onClick}
        className={className}
        style={style}
        aria-label={ariaLabel}
        sx={{ fontWeight: 700, textTransform: 'none' }}
      >
        {children}
      </Button>
    );
  }

  return (
    <Typography
      variant="subtitle1"
      component="h2"
      className={className}
      style={style}
      sx={{ m: 0, fontWeight: 700 }}
    >
      {children}
    </Typography>
  );
}

function MuiGrid({ children, className, style, role }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box className={className} style={style} role={role} sx={{ overflow: 'hidden' }}>
      {children}
    </Box>
  );
}

function MuiWeekDays({ children, className, style, role }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      role={role}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 2.25rem)',
        gap: '2px',
        mb: 0.5,
        '& > *': {
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
          lineHeight: '2.25rem',
        },
      }}
    >
      {children}
    </Box>
  );
}

function MuiDays({ children, className, style, role }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      role={role}
      sx={{
        '& [role="row"]': {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 2.25rem)',
          gap: '2px',
        },
      }}
    >
      {children}
    </Box>
  );
}

function MuiDay({
  children,
  onClick,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-current': ariaCurrent,
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const selected = ariaPressed === true || ariaPressed === 'true';
  const today = ariaCurrent === 'date';

  return (
    <Button
      size="small"
      type="button"
      variant={selected ? 'contained' : 'text'}
      color={selected ? 'primary' : 'inherit'}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-current={ariaCurrent}
      sx={{
        minWidth: '2.25rem',
        width: '2.25rem',
        height: '2.25rem',
        p: 0,
        borderRadius: '50%',
        opacity: disabled ? 0.35 : 1,
        outline: today && !selected ? '2px solid' : undefined,
        outlineColor: 'primary.main',
        outlineOffset: -2,
      }}
    >
      {children}
    </Button>
  );
}

function MuiYearSelect({ children, className, style, role }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      role={role}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        minWidth: '15.75rem',
        '& > button': {
          typography: 'body2',
          textTransform: 'none',
          borderRadius: 1,
          py: 1.25,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          '&[aria-pressed="true"]': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
          },
        },
      }}
    >
      {children}
    </Box>
  );
}

function MuiMonthGrid(props: HTMLAttributes<HTMLDivElement>) {
  return <MuiYearSelect {...props} />;
}

const muiSlots = {
  root: MuiRoot,
  header: MuiHeader,
  prevMonth: MuiPrev,
  nextMonth: MuiNext,
  heading: MuiHeading,
  grid: MuiGrid,
  weekDays: MuiWeekDays,
  days: MuiDays,
  day: MuiDay,
  yearSelect: MuiYearSelect,
  monthGrid: MuiMonthGrid,
};

export const Basic: Story = {
  render: () => (
    <StoryFrame>
      <Calendar defaultValue="2026-08-10" defaultMonth="2026-08" />
    </StoryFrame>
  ),
};

export const Compounds: Story = {
  render: () => (
    <StoryFrame title="Compound API + MUI Paper shell">
      <Calendar.Root defaultValue="2026-08-10" defaultMonth="2026-08">
        <Calendar.Header>
          <Calendar.PrevMonth />
          <Calendar.Heading />
          <Calendar.NextMonth />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.WeekDays />
          <Calendar.Days />
        </Calendar.Grid>
      </Calendar.Root>
    </StoryFrame>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <StoryFrame title="min / max">
      <Calendar
        defaultMonth="2026-08"
        min="2026-08-05"
        max="2026-08-25"
        defaultValue="2026-08-10"
      />
    </StoryFrame>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string | null>('2026-08-10');
    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">value: {value ?? '(none)'}</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Calendar value={value} onChange={setValue} defaultMonth="2026-08" />
        </Paper>
        <Button size="small" onClick={() => setValue(null)}>
          Clear
        </Button>
      </Stack>
    );
  },
};

export const LocaleZh: Story = {
  name: 'Locale zh-CN',
  render: () => (
    <StoryFrame title="locale=zh-CN">
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        locale="zh-CN"
        weekdayFormat="short"
      />
    </StoryFrame>
  ),
};

export const LocaleEn: Story = {
  name: 'Locale en-US',
  render: () => (
    <StoryFrame title="locale=en-US">
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        locale="en-US"
        weekdayFormat="short"
      />
    </StoryFrame>
  ),
};

export const ViewsMonthDay: Story = {
  name: 'Views month+day',
  render: () => (
    <StoryFrame title="views=['month','day']">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" views={['month', 'day']} />
    </StoryFrame>
  ),
};

export const ViewsYearDay: Story = {
  name: 'Views year+day',
  render: () => (
    <StoryFrame title="views=['year','day']">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" views={['year', 'day']} />
    </StoryFrame>
  ),
};

export const NoAnimation: Story = {
  render: () => (
    <StoryFrame title="animated={false}">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" animated={false} />
    </StoryFrame>
  ),
};

export const SlotRoot: Story = {
  name: 'Slot / root (Paper)',
  render: () => (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary">
        slots.root = MUI Paper
      </Typography>
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        disableDefaultStyles
        slots={{ root: MuiRoot }}
      />
    </Stack>
  ),
};

export const SlotHeader: Story = {
  name: 'Slot / header (Box)',
  render: () => (
    <StoryFrame title="slots.header = MUI Box">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" slots={{ header: MuiHeader }} />
    </StoryFrame>
  ),
};

export const SlotPrevNextMonth: Story = {
  name: 'Slot / prevMonth + nextMonth (IconButton)',
  render: () => (
    <StoryFrame title="slots.prevMonth / nextMonth = MUI IconButton">
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        slots={{ prevMonth: MuiPrev, nextMonth: MuiNext }}
      />
    </StoryFrame>
  ),
};

export const SlotHeading: Story = {
  name: 'Slot / heading (Button)',
  render: () => (
    <StoryFrame title="slots.heading = MUI Button / Typography">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" slots={{ heading: MuiHeading }} />
    </StoryFrame>
  ),
};

export const SlotGrid: Story = {
  name: 'Slot / grid (Box)',
  render: () => (
    <StoryFrame title="slots.grid = MUI Box">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" slots={{ grid: MuiGrid }} />
    </StoryFrame>
  ),
};

export const SlotWeekDays: Story = {
  name: 'Slot / weekDays (Box)',
  render: () => (
    <StoryFrame title="slots.weekDays = MUI Box">
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        slots={{ weekDays: MuiWeekDays }}
      />
    </StoryFrame>
  ),
};

export const SlotDays: Story = {
  name: 'Slot / days (Box)',
  render: () => (
    <StoryFrame title="slots.days = MUI Box">
      <Calendar defaultMonth="2026-08" defaultValue="2026-08-10" slots={{ days: MuiDays }} />
    </StoryFrame>
  ),
};

export const SlotDay: Story = {
  name: 'Slot / day (Button)',
  render: () => (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary">
        slots.day = MUI Button (full MUI chrome)
      </Typography>
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-15"
        disableDefaultStyles
        slots={{
          root: MuiRoot,
          header: MuiHeader,
          prevMonth: MuiPrev,
          nextMonth: MuiNext,
          heading: MuiHeading,
          grid: MuiGrid,
          weekDays: MuiWeekDays,
          days: MuiDays,
          day: MuiDay,
        }}
      />
    </Stack>
  ),
};

export const SlotYearSelect: Story = {
  name: 'Slot / yearSelect (Box)',
  render: () => (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary">
        slots.yearSelect · defaultView=year
      </Typography>
      <Calendar
        defaultMonth="2026-08"
        defaultView="year"
        disableDefaultStyles
        slots={{
          root: MuiRoot,
          header: MuiHeader,
          prevMonth: MuiPrev,
          nextMonth: MuiNext,
          heading: MuiHeading,
          yearSelect: MuiYearSelect,
        }}
      />
    </Stack>
  ),
};

export const SlotMonthGrid: Story = {
  name: 'Slot / monthGrid (Box)',
  render: () => (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary">
        slots.monthGrid · defaultView=month
      </Typography>
      <Calendar
        defaultMonth="2026-08"
        defaultView="month"
        disableDefaultStyles
        slots={{
          root: MuiRoot,
          header: MuiHeader,
          prevMonth: MuiPrev,
          nextMonth: MuiNext,
          heading: MuiHeading,
          monthGrid: MuiMonthGrid,
        }}
      />
    </Stack>
  ),
};

export const SlotAll: Story = {
  name: 'Slot / all 11 (MUI)',
  render: () => (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary">
        All 11 slots = MUI. Click heading to open month / year views.
      </Typography>
      <Calendar
        defaultMonth="2026-08"
        defaultValue="2026-08-10"
        disableDefaultStyles
        slots={muiSlots}
      />
    </Stack>
  ),
};
