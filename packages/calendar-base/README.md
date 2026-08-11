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

## 受控 / 非受控

| 状态     | 非受控         | 受控                      |
| -------- | -------------- | ------------------------- |
| 选中日期 | `defaultValue` | `value` + `onChange`      |
| 当前月   | `defaultMonth` | `month` + `onMonthChange` |
| 当前视图 | `defaultView`  | `view` + `onViewChange`   |

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

## Locale 与星期

```tsx
<Calendar locale="zh-CN" weekdayFormat="short" weekStartsOn={1} />
```

- `locale`：标题、星期、年/月标签（`Intl.DateTimeFormat`）
- `weekdayFormat`：`'narrow' | 'short' | 'long'`（默认 `short`）
- `weekStartsOn`：`0`–`6`（默认 `1` = 周一）

## 样式

默认 import `styles.css` 后会挂 `uikit-cal*` class。关闭默认 class：

```tsx
<Calendar disableDefaultStyles />
```

仍可自行 import CSS，或完全用 slots / 自写样式。

**状态语义**：`aria-pressed` / `aria-current` / `disabled`，**无** `data-*` 状态属性。

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

动画：`__grid--up` / `--down` / `--enlarge` / `--reduce`（尊重 `prefers-reduced-motion`）。

## Slots（11）

`root` · `header` · `prevMonth` · `nextMonth` · `heading` · `grid` · `weekDays` · `days` · `day` · `yearSelect` · `monthGrid`

Prev/Next 默认内置 SVG chevron，可用对应 slot 替换。

```tsx
<Calendar
  disableDefaultStyles
  slots={{
    root: 'section',
    day: MyDayButton,
  }}
  slotProps={{
    root: { className: 'my-cal' },
    day: { className: 'my-day' },
  }}
/>
```

Storybook（`apps/ui-storybook`）里有用 MUI `Paper` / `IconButton` / `Button` 挂满 11 slots 的示例。

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

可用：`Root` / `Header` / `PrevMonth` / `NextMonth` / `Heading` / `Grid` / `WeekDays` / `Days` / `Day` / `YearSelect` / `MonthGrid`。

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
