# @uikit-react/calendar-base

基础日历组件：可选默认样式、11 个 slots、year / month / day 视图。日期值统一为 `YYYY-MM-DD`（`null` 表示未选）。

不依赖 popover；可与 `@uikit-react/date-picker` 等上层组合。

## 安装

```ts
import { Calendar, useCalendar } from '@uikit-react/calendar-base';
import '@uikit-react/calendar-base/styles.css';
```

Peer：`react` / `react-dom` ^19。

## 目录

```
src/
├── components/   # Calendar compounds、icons、slot helpers
├── hooks/        # useCalendar
├── utils/        # date-string、matrix、views、动画 class
├── styles/       # calendar.scss（tsup + esbuild-sass-plugin → dist/styles.css）
├── types/
└── index.ts
```

## 快速开始

```tsx
import { Calendar } from '@uikit-react/calendar-base';
import '@uikit-react/calendar-base/styles.css';

<Calendar defaultValue="2026-08-10" defaultMonth="2026-08" locale="zh-CN" />;
```

## 选区模式

```tsx
{
  /* 单日（默认） */
}
<Calendar value="2026-08-10" onChange={setDate} />;

{
  /* 区间：两次点击选 start → end；未完成时 end 为 null */
}
<Calendar selectionMode="range" value={range} onChange={setRange} />;
```

区间值：`{ start: 'YYYY-MM-DD'; end: 'YYYY-MM-DD' | null } | null`。  
日格 class：`--range-start` / `--range-end` / `--in-range`；选第二日 hover 时额外加 `--preview`。

## 多月面板

```tsx
<Calendar numberOfMonths={2} defaultMonth="2026-08" />
<Calendar selectionMode="range" numberOfMonths={2} defaultMonth="2026-08" />
```

- `month` 为**第一个**可见月；右侧依次 +1
- day 视图：每面板自带 heading，prev 在左侧、next 在右侧
- year / month 视图仍为单面板
- compounds：`Calendar.Panels` / `Calendar.Panel`；`Calendar.Days month="2026-09"`

## 受控 / 非受控

| 状态            | 非受控         | 受控                      |
| --------------- | -------------- | ------------------------- |
| 选中日期 / 区间 | `defaultValue` | `value` + `onChange`      |
| 当前月          | `defaultMonth` | `month` + `onMonthChange` |
| 当前视图        | `defaultView`  | `view` + `onViewChange`   |

```tsx
const [value, setValue] = useState<string | null>('2026-08-10');
const [month, setMonth] = useState('2026-08');

<Calendar
  value={value}
  onChange={setValue}
  month={month}
  onMonthChange={setMonth}
  locale="en-US"
/>;
```

未传 `defaultMonth` / `month` 时，初始月取自 `value` / `defaultValue`，否则为今天。

## 视图

```tsx
<Calendar views={['month', 'day']} />
<Calendar views={['year', 'day']} />
<Calendar defaultView="month" />
```

- 默认 `views={['year', 'month', 'day']}`
- Heading：向更粗视图钻出（仅 `views` 内允许的）
- 选年 / 选月：向更细视图钻入
- Prev / Next：day 翻月、month 翻年、year 翻 12 年页

## 日期约束

```tsx
<Calendar min="2026-08-01" max="2026-08-31" isDateDisabled={(date) => date === '2026-08-15'} />
```

超出 `min`/`max` 或 `isDateDisabled` 为 true 的日期：`disabled`，点击不触发 `onChange`。

### `dayOf`（假期 / 周末加班等）

按天返回外部规则，可同时控制 `disabled` 与额外 `className`：

```tsx
const holidays = new Set(['2026-10-01', '2026-10-02']);
const overtimeWeekends = new Set(['2026-08-15']); // 加班的周末 → 可点

<Calendar
  dayOf={({ date, isWeekend }) => {
    if (holidays.has(date)) {
      return { disabled: true, className: 'is-holiday' };
    }
    if (isWeekend && !overtimeWeekends.has(date)) {
      return { disabled: true, className: 'is-weekend' };
    }
  }}
/>;
```

回调参数：`date`、`dayOfWeek`（0–6）、`isWeekend`、`isToday`、`inCurrentMonth`。与 `min` / `max` / `isDateDisabled` 取并集禁用。

## Locale 与星期

```tsx
<Calendar locale="zh-CN" weekdayFormat="short" weekStartsOn={1} />
```

- `locale`：标题、星期、年/月标签（`Intl.DateTimeFormat`）
- `weekdayFormat`：`'narrow' | 'short' | 'long'`（默认 `short`）
- `weekStartsOn`：`0`–`6`（默认 `1` = 周一）

## 相邻月日期

```tsx
<Calendar showOutsideDays={false} />
```

- 默认 `true`：网格填满上/下月日期（`--outside`）
- `false`：相邻月格子留空，仍保持 6×7 布局

## 样式

默认 import `styles.css` 后会挂 `uikit-cal*` class。关闭默认 class：

```tsx
<Calendar disableDefaultStyles />
```

仍可自行 import CSS，或完全用 slots / 自写样式。

Calendar **不**注入 `aria-*` / `data-*` / `role`；无障碍由调用方在 slot 上自行决定。状态通过显式 props 与（可选）默认 CSS class 表达。

### CSS 变量

| 变量                 | 用途               |
| -------------------- | ------------------ |
| `--uikit-cal-cell`   | 日格尺寸           |
| `--uikit-cal-gap`    | 网格间距           |
| `--uikit-cal-accent` | 选中 / 强调色      |
| `--uikit-cal-fg`     | 前景色             |
| `--uikit-cal-muted`  | 弱化色（月外日等） |

### 主要 class

`uikit-cal` · `__header` · `__heading` · `__nav` · `__grid` · `__weekdays` · `__day` · `__day--selected` · `__day--today` · `__day--outside` · `__day--disabled` · `__year-select` · `__month-grid` · `__year` · `__month` · `__year--selected` · `__month--selected`

动画：day 翻月 `__days--up` / `--down`；切视图 `__grid--enlarge` / `--reduce`（年/月面板仍用 `__grid--up` / `--down`）。尊重 `prefers-reduced-motion`。

## Slots

`root` · `header` · `prevMonth` · `nextMonth` · `heading` · `grid` · `weekDays` · `days` · `day` · `year` · `yearSelect` · `month` · `monthGrid` · `panels` · `panel`

Prev/Next 默认内置 SVG chevron，可用对应 slot 替换。

```tsx
function MyDay({
  label,
  selected,
  today,
  outside,
  disabled,
  children,
  ...rest
}: CalendarDaySlotProps) {
  return (
    <button
      type="button"
      aria-label={label} // 可选：自行决定是否做 a11y
      aria-pressed={selected || undefined}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

<Calendar disableDefaultStyles slots={{ day: MyDay }} />;
```

| Slot                      | 类型                       | 显式状态                                                                                |
| ------------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `day`                     | `CalendarDaySlotProps`     | `label` `date` `selected` `today` `outside` `rangeStart` `rangeEnd` `inRange` `preview` |
| `prevMonth` / `nextMonth` | `CalendarNavSlotProps`     | `label` `view`                                                                          |
| `heading`                 | `CalendarHeadingSlotProps` | `label` `view` `drillable`                                                              |
| `year`                    | `CalendarYearSlotProps`    | `year` `label` `selected`                                                               |
| `month`                   | `CalendarMonthSlotProps`   | `month` `monthValue` `label` `selected`                                                 |

请把状态字段解构掉，勿整包 spread 到原生 DOM。`CalendarDayProps`（带 `cell`）只给 compound 的 `Calendar.Day` 用。

Storybook（`apps/ui-storybook`）里有用 MUI 挂满 slots 的示例。

## Compounds

适合拆布局时自行组装：

```tsx
<Calendar.Root defaultMonth="2026-08" locale="zh-CN">
  <Calendar.Header>
    <Calendar.PrevMonth />
    <Calendar.Heading />
    <Calendar.NextMonth />
  </Calendar.Header>
  {/* 或按 view 自行切换 YearSelect / MonthGrid / Grid */}
  <Calendar.Grid>
    <Calendar.WeekDays />
    <Calendar.Days />
  </Calendar.Grid>
</Calendar.Root>
```

可用：`Root` / `Header` / `PrevMonth` / `NextMonth` / `Heading` / `Grid` / `WeekDays` / `Days` / `Day` / `YearSelect` / `MonthGrid` / `Panels` / `Panel`。

默认 `<Calendar />` 会按 `view` 自动渲染 `YearSelect` / `MonthGrid` / 日网格。

## `useCalendar`

无 UI 的状态与行为；`Calendar.Root` 内部也基于它。

```tsx
const cal = useCalendar({
  defaultMonth: '2026-08',
  views: ['year', 'month', 'day'],
  onChange: (date) => console.log(date),
});

cal.selectDate('2026-08-15');
cal.drillUp();
cal.goToNext();
cal.selectYear(2024);
cal.selectMonth('2024-03');
```

常用返回：`value` / `month` / `view` / `cells` / `isSelected` / `isDisabled` / `isToday` / `selectDate` / `selectMonth` / `selectYear` / `goToPrev` / `goToNext` / `drillUp` / `monthSlideDirection` / `viewTransition`。

## 动画

| Prop                  | 说明                                            |
| --------------------- | ----------------------------------------------- |
| `animated`            | 默认 `true`；`false` 时不挂动画状态 / class     |
| `animationClassNames` | `{ up, down, enlarge, reduce }`，覆盖默认 class |
| `animationDuration`   | 动画状态保持时长（ms，默认 `500`）              |

- 翻月：`up` / `down`
- 视图切换：`enlarge`（钻入更细）/ `reduce`（钻出更粗）
- 也可读 `monthSlideDirection`、`viewTransition` 自行绑定动画

```tsx
<Calendar
  animationClassNames={{
    up: 'my-cal-up',
    down: 'my-cal-down',
    enlarge: 'my-cal-enlarge',
    reduce: 'my-cal-reduce',
  }}
  animationDuration={500}
/>
```

## 导出

| 导出                                    | 说明                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Calendar`                              | 默认日历 + compounds                                                                                                                                                      |
| `useCalendar`                           | 无头 hook                                                                                                                                                                 |
| date utils                              | `isValidDateString` / `parseDateString` / `toDateString` / `compareDateString` / `clampDateString` / `toMonthString` / `addMonths` / `startOfMonth` / `getTodayString` 等 |
| `buildCalendarMatrix`                   | 月网格矩阵                                                                                                                                                                |
| types                                   | `CalendarProps` / `CalendarView` / `DateString` / …                                                                                                                       |
| `@uikit-react/calendar-base/styles.css` | 默认样式                                                                                                                                                                  |

## 脚本

```bash
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
```
