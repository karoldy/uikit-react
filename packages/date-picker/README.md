# @uikit-react/date-picker

无样式（headless）弹出式日期选择器。组合 `@uikit-react/popover` + `@uikit-react/calendar-base`。

- `DatePicker`：单日 `YYYY-MM-DD | null`
- `DateRangePicker`（别名 `RangePicker`）：区间 `{ start, end } | null`

日历网格请用 [`@uikit-react/calendar-base`](../calendar-base/README.md)（本包**不** re-export `Calendar`）。

## 安装

```ts
import { DatePicker, DateRangePicker, RangePicker } from '@uikit-react/date-picker';
```

Peer：`react` / `react-dom` ^19。依赖：`@uikit-react/calendar-base`、`@uikit-react/popover`。

## 目录

```
src/
├── components/   # DatePicker, DateRangePicker
├── hooks/        # useDatePicker, useDateRangePicker
├── utils/        # formatDateRange
├── types/
└── index.ts
```

## DatePicker

```tsx
import { DatePicker } from '@uikit-react/date-picker';

<DatePicker defaultValue="2026-08-10" placeholder="Select date" />;
```

`closeOnSelect` 默认为 `true`。

## DateRangePicker / RangePicker

```tsx
import { DateRangePicker, RangePicker } from '@uikit-react/date-picker';

// 单面板
<DateRangePicker defaultMonth="2026-08" placeholder="Select range" />

// 双面板
<RangePicker numberOfMonths={2} defaultMonth="2026-08" />
```

- 值：`{ start: 'YYYY-MM-DD'; end: 'YYYY-MM-DD' | null } | null`（选第二日前 `end` 为 `null`）
- `closeOnSelect`（默认 `true`）：**两端都选完**后才关弹层
- Trigger 文案：`2026-08-10 – 2026-08-15`；未完成时 `2026-08-10 – …`
- `separator` 可自定义分隔符（默认 `–`）
- 支持 hover preview（calendar-base）

```tsx
const [range, setRange] = useState<CalendarDateRange | null>(null);

<DateRangePicker numberOfMonths={2} value={range} onChange={setRange} defaultMonth="2026-08" />;
```

## 值格式

| 组件            | 类型                        | 示例                                         |
| --------------- | --------------------------- | -------------------------------------------- |
| DatePicker      | `YYYY-MM-DD \| null`        | `"2026-08-10"`                               |
| DateRangePicker | `CalendarDateRange \| null` | `{ start: '2026-08-10', end: '2026-08-15' }` |

## slots / slotProps

- `calendarSlots` / `calendarSlotProps` → 转发 Calendar
- `slotProps.trigger` / `slotProps.content` → Popover

## 脚本

```bash
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
pnpm --filter @uikit-react/date-picker build
```
