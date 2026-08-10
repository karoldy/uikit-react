# @uikit-react/calendar-base

无样式（headless）日历网格与日期字符串工具。公共值为本地日历日 `YYYY-MM-DD | null`。

## 安装

monorepo 私有包：

```ts
import { Calendar, useCalendar, buildCalendarMatrix } from '@uikit-react/calendar-base';
```

Peer：`react` / `react-dom` ^19。**不依赖** `@uikit-react/popover`。弹出式选择请用 `@uikit-react/date-picker`。

## 目录

```
src/
├── components/   # Calendar compounds + context
├── hooks/        # useCalendar
├── utils/        # date-string, calendar-matrix
├── types/
└── index.ts
```

## Calendar

```tsx
import { Calendar } from '@uikit-react/calendar-base';

export function Example() {
  return (
    <Calendar
      defaultValue="2026-08-10"
      defaultMonth="2026-08"
      onChange={(date) => console.log(date)}
    />
  );
}
```

也可组合：`Calendar.Root`、`Calendar.Header`、`Calendar.Grid`、`Calendar.Day` 等。

## 值格式

| 类型 | 格式         | 示例           |
| ---- | ------------ | -------------- |
| 日期 | `YYYY-MM-DD` | `"2026-08-10"` |
| 月份 | `YYYY-MM`    | `"2026-08"`    |
| 空值 | `null`       | 未选择         |

按**本地日历日**解析，避免时区偏移。工具：`parseDateString`、`toDateString`、`compareDateString`、`clampDateString`、`addMonths`、`buildCalendarMatrix` 等。

## Day `data-*`

| 属性                 | 条件     |
| -------------------- | -------- |
| `data-selected`      | 当前选中 |
| `data-today`         | 当天     |
| `data-outside-month` | 非当月   |
| `data-disabled`      | 不可选   |

支持 `slots.day` / `slotProps.day`。

## Follow-ups

方向键键盘导航；`data-focused` 样式钩子。

## 脚本

```bash
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
```
