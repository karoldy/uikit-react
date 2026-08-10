# @uikit-react/date-picker

无样式（headless）弹出式单日期选择器。组合 `@uikit-react/popover` + `@uikit-react/calendar-base`。公共值：`YYYY-MM-DD | null`。

日历网格与日期工具请用 [`@uikit-react/calendar-base`](../calendar-base/README.md)（本包**不再** re-export `Calendar`）。

## 安装

```ts
import { DatePicker } from '@uikit-react/date-picker';
```

Peer：`react` / `react-dom` ^19。依赖：`@uikit-react/calendar-base`、`@uikit-react/popover`。

## 目录

```
src/
├── components/   # DatePicker
├── hooks/        # useDatePicker
├── types/
└── index.ts
```

## DatePicker

```tsx
import { DatePicker } from '@uikit-react/date-picker';

export function Example() {
  return (
    <DatePicker defaultValue="2026-08-10" placeholder="Select date">
      {/* 或 asChild 合并到 MUI Button 等 */}
    </DatePicker>
  );
}
```

`closeOnSelect` 默认为 `true`。

需要嵌入式日历时：

```ts
import { Calendar } from '@uikit-react/calendar-base';
```

## 值格式

| 类型 | 格式         | 示例           |
| ---- | ------------ | -------------- |
| 日期 | `YYYY-MM-DD` | `"2026-08-10"` |
| 空值 | `null`       | 未选择         |

## slots / slotProps

- `calendarSlots` / `calendarSlotProps` → 转发 Calendar（如 `day`）
- `slotProps.trigger` / `slotProps.content` → Popover

## Follow-ups

见 calendar-base：键盘导航、`data-focused`。

## 脚本

```bash
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
```
