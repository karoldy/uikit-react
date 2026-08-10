# Date Picker Design

**Date:** 2026-08-10  
**Status:** Implemented; layout superseded for packaging  
**Package:** `@uikit-react/date-picker` (private)

> **Layout update:** `@uikit-react/calendar-base` is now a physical workspace package. See `2026-08-10-calendar-base-extract-design.md`. The “logical split only / no physical package” non-goal below is obsolete.

## Goals

Ship a **headless, single-date** picker whose public value is a calendar day string (`YYYY-MM-DD | null`), with:

- A reusable **calendar-base** layer (grid + utils + unstyled `Calendar`)
- A **DatePicker** composition that wires `@uikit-react/popover` + trigger + calendar
- Unstyled UI with **`data-*` hooks** and **slots / slotProps** (same idea as popover)
- Storybook demos (MUI or light CSS for visuals only)

## Non-goals (this pass)

- Date range / multi-select / date-time
- Built-in Material visual theme / CSS bundle
- Lunar calendar
- ~~Physically splitting `@uikit-react/calendar-base` into its own package (logical split only)~~ → done in extract spec
- Publishing to npm

## Decisions

| Topic | Choice |
|-------|--------|
| Approach | Headless / composable (not MUI X wrap, not full styled kit) |
| Selection mode | Single date only |
| Public value | `YYYY-MM-DD` string or `null` |
| Popover | Packaged `DatePicker` uses `@uikit-react/popover`; `Calendar` stays popover-free |
| Styling | Unstyled + `data-*` + slots/slotProps |
| Package layout | **Compromise:** one package, directories as if two packages for a later extract |

## Package layout

```
packages/date-picker/
├── src/
│   ├── calendar-base/          # future @uikit-react/calendar-base
│   │   ├── date-string.ts
│   │   ├── calendar-matrix.ts
│   │   ├── Calendar.tsx
│   │   ├── use-calendar.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── date-picker/            # composition layer
│   │   ├── DatePicker.tsx
│   │   ├── use-date-picker.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts                # re-exports Calendar + DatePicker + utils
├── tests/
├── README.md
└── package.json
```

**Dependency rules**

- `calendar-base` must not import popover
- `date-picker` may import `../calendar-base` and `@uikit-react/popover`
- Peer: `react` / `react-dom` `^19`

## calendar-base

### Date string utils (`date-string.ts`)

- Parse / format / compare `YYYY-MM-DD` in **local calendar** semantics (no timezone shift surprises for “calendar days”)
- Helpers: `isValidDateString`, `compareDateString`, `clampDate`, `addMonths` → `YYYY-MM`, etc.

### Matrix (`calendar-matrix.ts`)

- Build a fixed **6×7** (or minimal weeks) cell list for a visible month
- Each cell: `{ date: YYYY-MM-DD, inCurrentMonth: boolean }`
- `weekStartsOn: 0–6` (default derived from locale when possible; zh often `1`)

### `useCalendar` / `Calendar`

**Root options**

| Prop | Type | Notes |
|------|------|------|
| `value` / `defaultValue` | `string \| null` | Controlled / uncontrolled |
| `onChange` | `(date: string \| null) => void` | |
| `month` / `defaultMonth` / `onMonthChange` | `YYYY-MM` | Visible month |
| `min` / `max` | `YYYY-MM-DD` | Inclusive bounds |
| `isDateDisabled` | `(date: string) => boolean` | |
| `weekStartsOn` | `0–6` | |
| `locale` | `string` | `Intl` for month/weekday labels |

**Compound surface (illustrative)**

- `Calendar.Root`
- `Calendar.Header` / `PrevMonth` / `NextMonth` / `Heading`
- `Calendar.Grid` / `WeekDays` / `Days` / `Day`
- Convenience `<Calendar />` that assembles the default structure

**Day state hooks (for styling)**

- `data-selected`
- `data-today`
- `data-outside-month`
- `data-disabled`
- `data-focused`

**slots / slotProps**

- At least: `root`, `day`, `heading` (typed like popover `SlotPropsOf<T>`)
- Consumers replace nodes without forking logic

## date-picker composition

### `DatePicker`

Batteries-included:

- State: `value`, `open`, visible `month`
- UI: `Popover.Root` + trigger (default button or `asChild`) showing formatted value / placeholder
- `Popover.Content` hosts `Calendar`
- Selecting a day updates `value` and **closes** the popover by default (`closeOnSelect`, default `true`)
- Forwards relevant calendar props (`min` / `max` / `isDateDisabled` / `locale` / …)
- Optional `slotProps` for popover content focus manager when needed

### `useDatePicker`

Headless state only (`value`, `month`, `open`, setters / prop getters) for custom chrome.

## Storybook

Under `apps/ui-storybook`:

1. **Calendar** — unstyled grid + minimal demo CSS or MUI `Box`/`sx` for readability  
2. **DatePicker** — default composition with MUI `Button` trigger via `asChild` where useful  
3. **Constraints** — `min` / `max` / disabled dates  
4. **Controlled** — external `value` / `onChange`

## Testing

Vitest + Testing Library (same stack as popover):

- Unit: `date-string`, `calendar-matrix`
- Component: select day, month navigation, min/max/disabled
- DatePicker: open → select → value + closed

## Success criteria

1. `pnpm --filter @uikit-react/date-picker test|typecheck|lint` pass  
2. Storybook stories allow picking a single `YYYY-MM-DD`  
3. `calendar-base` has zero imports from popover  
4. Public exports document Calendar vs DatePicker clearly in package README  

## Follow-ups (out of scope)

- Extract `@uikit-react/calendar-base` package  
- Range picker  
- Time picker  
- First-class i18n message catalogs beyond `Intl`
