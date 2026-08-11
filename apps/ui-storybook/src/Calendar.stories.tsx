import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import {
  Calendar,
  type CalendarDateRange,
  type CalendarDaySlotProps,
  type CalendarHeadingSlotProps,
  type CalendarMonthSlotProps,
  type CalendarNavSlotProps,
  type CalendarYearSlotProps,
} from '@uikit-react/calendar-base';
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
  label,
  view: _view,
  onClick,
  disabled,
  className,
  style,
  children,
}: CalendarNavSlotProps) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={label}
    >
      {children ?? '‹'}
    </IconButton>
  );
}

function MuiNext({
  label,
  view: _view,
  onClick,
  disabled,
  className,
  style,
  children,
}: CalendarNavSlotProps) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={label}
    >
      {children ?? '›'}
    </IconButton>
  );
}

function MuiHeading({
  label,
  view: _view,
  drillable,
  children,
  onClick,
  className,
  style,
}: CalendarHeadingSlotProps) {
  if (drillable) {
    return (
      <Button
        size="small"
        color="inherit"
        type="button"
        onClick={onClick}
        className={className}
        style={style}
        aria-label={`Switch view from ${_view}`}
        sx={{ fontWeight: 700, textTransform: 'none' }}
      >
        {children ?? label}
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
      {children ?? label}
    </Typography>
  );
}

function MuiGrid({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box className={className} style={style} sx={{ overflow: 'hidden' }}>
      {children}
    </Box>
  );
}

function MuiWeekDays({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
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

function MuiDays({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 2.25rem)',
        gap: '2px',
      }}
    >
      {children}
    </Box>
  );
}

function MuiDay({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  className,
  style,
  label,
  selected,
  today,
  outside,
  date: _date,
  rangeStart: _rangeStart,
  rangeEnd: _rangeEnd,
  inRange: _inRange,
  preview: _preview,
}: CalendarDaySlotProps) {
  const isHoliday = Boolean(className?.includes('is-holiday'));

  return (
    <Button
      size="small"
      type="button"
      variant={selected ? 'contained' : 'text'}
      color={selected ? 'primary' : 'inherit'}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={className}
      style={style}
      aria-label={label}
      aria-pressed={selected || undefined}
      aria-current={today ? 'date' : undefined}
      sx={{
        minWidth: '2.25rem',
        width: '2.25rem',
        height: '2.25rem',
        p: 0,
        borderRadius: '50%',
        opacity: disabled ? 0.35 : outside ? 0.4 : 1,
        color: isHoliday ? 'error.main' : undefined,
        fontWeight: isHoliday ? 700 : undefined,
        outline: today && !selected ? '2px solid' : undefined,
        outlineColor: 'primary.main',
        outlineOffset: -2,
      }}
    >
      {children}
    </Button>
  );
}

function MuiYear({
  label,
  year: _year,
  selected,
  onClick,
  className,
  style,
  children,
}: CalendarYearSlotProps) {
  return (
    <Button
      type="button"
      variant={selected ? 'contained' : 'outlined'}
      color={selected ? 'primary' : 'inherit'}
      onClick={onClick}
      className={className}
      style={style}
      sx={{ typography: 'body2', textTransform: 'none', py: 1.25 }}
    >
      {children ?? label}
    </Button>
  );
}

function MuiMonth({
  label,
  month: _month,
  monthValue: _monthValue,
  selected,
  onClick,
  className,
  style,
  children,
}: CalendarMonthSlotProps) {
  return (
    <Button
      type="button"
      variant={selected ? 'contained' : 'outlined'}
      color={selected ? 'primary' : 'inherit'}
      onClick={onClick}
      className={className}
      style={style}
      sx={{ typography: 'body2', textTransform: 'none', py: 1.25 }}
    >
      {children ?? label}
    </Button>
  );
}

function MuiYearSelect({ children, className, style }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      style={style}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        minWidth: '15.75rem',
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
  year: MuiYear,
  yearSelect: MuiYearSelect,
  month: MuiMonth,
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

export const HideOutsideDays: Story = {
  render: () => (
    <StoryFrame title="showOutsideDays={false}">
      <Calendar defaultMonth="2026-08" showOutsideDays={false} />
    </StoryFrame>
  ),
};

export const DayOf: Story = {
  render: () => {
    const holidays = new Set(['2026-08-12', '2026-08-13']);
    const overtimeWeekend = new Set(['2026-08-15']);
    return (
      <StoryFrame title="dayOf — holidays / weekends / overtime">
        <style>{`
          .is-holiday { color: #c62828 !important; }
          .is-weekend { opacity: 0.55; }
          .is-overtime { outline: 1px dashed #2e7d32; }
        `}</style>
        <Calendar
          defaultMonth="2026-08"
          locale="en-US"
          dayOf={({ date, isWeekend }) => {
            if (holidays.has(date)) {
              return { disabled: true, className: 'is-holiday' };
            }
            if (overtimeWeekend.has(date)) {
              return { className: 'is-overtime' };
            }
            if (isWeekend) {
              return { disabled: true, className: 'is-weekend' };
            }
          }}
        />
      </StoryFrame>
    );
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string | null>('2026-08-10');
    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">value: {value ?? '(none)'}</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Calendar
            value={value}
            onChange={(next) => {
              if (typeof next === 'string' || next === null) {
                setValue(next);
              }
            }}
            defaultMonth="2026-08"
          />
        </Paper>
        <Button size="small" onClick={() => setValue(null)}>
          Clear
        </Button>
      </Stack>
    );
  },
};

function formatRange(range: CalendarDateRange | null) {
  if (!range) {
    return '(none)';
  }
  return `${range.start} → ${range.end ?? '…'}`;
}

export const Range: Story = {
  name: 'Range / basic',
  render: () => (
    <StoryFrame title="selectionMode=range · click start then end · hover to preview">
      <Calendar
        selectionMode="range"
        defaultMonth="2026-08"
        defaultValue={{ start: '2026-08-10', end: '2026-08-15' }}
      />
    </StoryFrame>
  ),
};

export const RangeControlled: Story = {
  name: 'Range / controlled',
  render: function RangeControlledStory() {
    const [value, setValue] = useState<CalendarDateRange | null>({
      start: '2026-08-10',
      end: '2026-08-15',
    });

    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="caption" color="text.secondary">
          selectionMode=range · hover after first click for preview
        </Typography>
        <Typography variant="body2">value: {formatRange(value)}</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Calendar
            selectionMode="range"
            value={value}
            onChange={(next) => {
              if (next === null || typeof next === 'object') {
                setValue(next);
              }
            }}
            defaultMonth="2026-08"
          />
        </Paper>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setValue({ start: '2026-08-05', end: '2026-08-20' })}>
            Set Aug 5–20
          </Button>
          <Button size="small" onClick={() => setValue(null)}>
            Clear
          </Button>
        </Stack>
      </Stack>
    );
  },
};

export const RangePartial: Story = {
  name: 'Range / picking end (hover preview)',
  render: () => (
    <StoryFrame title="defaultValue end=null · hover other days to preview">
      <Calendar
        selectionMode="range"
        defaultMonth="2026-08"
        defaultValue={{ start: '2026-08-10', end: null }}
      />
    </StoryFrame>
  ),
};

export const MultiMonth: Story = {
  name: 'Multi-month / 2 panels',
  render: () => (
    <StoryFrame title="numberOfMonths={2} · shared navigation">
      <Calendar numberOfMonths={2} defaultMonth="2026-08" defaultValue="2026-08-10" />
    </StoryFrame>
  ),
};

export const RangeMultiMonth: Story = {
  name: 'Range / 2 panels',
  render: function RangeMultiMonthStory() {
    const [value, setValue] = useState<CalendarDateRange | null>({
      start: '2026-08-25',
      end: '2026-09-05',
    });

    return (
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="caption" color="text.secondary">
          selectionMode=range · numberOfMonths=2 · hover preview across panels
        </Typography>
        <Typography variant="body2">value: {formatRange(value)}</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Calendar
            selectionMode="range"
            numberOfMonths={2}
            value={value}
            onChange={(next) => {
              if (next === null || typeof next === 'object') {
                setValue(next);
              }
            }}
            defaultMonth="2026-08"
          />
        </Paper>
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
  name: 'Slot / all — receive props & style',
  render: () => {
    const holidays = new Set(['2026-08-12', '2026-08-13']);

    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 560 }}>
        <Typography variant="body2" color="text.secondary">
          自定义 slot 时，Calendar 会把行为 props 注入到你的组件。用{' '}
          <code>disableDefaultStyles</code> 关掉内置 class 后，用下面这些字段自己画样式。
        </Typography>

        <Paper variant="outlined" sx={{ p: 1.5, width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom>
            显式状态 props（Calendar 不注入 aria-* / data-* / role）
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2,
              typography: 'caption',
              color: 'text.secondary',
              '& code': { fontSize: '0.75rem' },
            }}
          >
            <li>
              <code>day</code>：<code>label</code> <code>selected</code> <code>today</code>{' '}
              <code>outside</code> <code>disabled</code> + range 字段
            </li>
            <li>
              <code>prevMonth</code> / <code>nextMonth</code>：<code>label</code> <code>view</code>
            </li>
            <li>
              <code>heading</code>：<code>label</code> <code>view</code> <code>drillable</code>
            </li>
            <li>
              <code>year</code> / <code>month</code>：<code>label</code> <code>selected</code>
            </li>
            <li>
              本例在 MUI 组件上自行加了 <code>aria-label</code>；是否无障碍由你决定
            </li>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 0 }}>
          <Calendar
            defaultMonth="2026-08"
            defaultValue="2026-08-10"
            disableDefaultStyles
            dayOf={({ date, inCurrentMonth }) => {
              if (!inCurrentMonth) {
                return { className: 'is-outside' };
              }
              if (holidays.has(date)) {
                return { disabled: true, className: 'is-holiday' };
              }
            }}
            slots={muiSlots}
            slotProps={{
              // Extra props merged onto every day slot (after Calendar state props).
              day: { className: 'story-day' },
              root: { 'aria-label': 'MUI-skinned calendar' },
            }}
          />
        </Paper>

        <Typography variant="caption" color="text.secondary">
          点标题可切到 month / year。year / month 格子同样用 <code>aria-pressed</code> 表示选中（见{' '}
          <code>MuiYearSelect</code> 里的 CSS）。
        </Typography>
      </Stack>
    );
  },
};
