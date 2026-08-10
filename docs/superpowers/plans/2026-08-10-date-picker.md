# Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `@uikit-react/date-picker` with a logical `calendar-base` layer (YYYY-MM-DD utils + unstyled Calendar) and a `DatePicker` that composes `@uikit-react/popover`, plus Storybook demos.

**Architecture:** Single private package with two directories. `calendar-base` is popover-free (date math + Calendar compound/hook). `date-picker` owns open state and wires Popover + Calendar. Public value is always `YYYY-MM-DD | null`.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, `@uikit-react/popover`, Storybook 9 (existing app)

**Spec:** `docs/superpowers/specs/2026-08-10-date-picker-design.md`

## Global Constraints

- Package name: `@uikit-react/date-picker`, `"private": true`
- Public date value: `YYYY-MM-DD` string or `null` (local calendar-day semantics)
- Single-date only — no range / multi / time
- Unstyled UI: `data-*` hooks + slots/slotProps; no shipped theme CSS
- `src/calendar-base/**` must never import `@uikit-react/popover`
- `date-picker` composition depends on `workspace:@uikit-react/popover`
- Peer deps: `react` / `react-dom` `^19`
- Mirror popover package scripts: `test`, `typecheck`, `lint` (vitest + jsdom)
- Commits: only when the user explicitly asks (skip commit steps otherwise)

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `packages/date-picker/package.json` | Workspace package metadata + vitest deps + popover dep |
| `packages/date-picker/tsconfig.json` | Extends repo base |
| `packages/date-picker/vitest.config.ts` | jsdom + setup |
| `packages/date-picker/src/calendar-base/date-string.ts` | Parse/format/compare/clamp/addMonths |
| `packages/date-picker/src/calendar-base/calendar-matrix.ts` | 6×7 month grid cells |
| `packages/date-picker/src/calendar-base/types.ts` | Calendar option/return types |
| `packages/date-picker/src/calendar-base/use-calendar.ts` | Calendar state + day helpers |
| `packages/date-picker/src/calendar-base/calendar-context.ts` | Compound context |
| `packages/date-picker/src/calendar-base/Calendar.tsx` | Compound + default assemble |
| `packages/date-picker/src/calendar-base/index.ts` | calendar-base public surface |
| `packages/date-picker/src/date-picker/types.ts` | DatePicker types |
| `packages/date-picker/src/date-picker/use-date-picker.ts` | value + open + month |
| `packages/date-picker/src/date-picker/DatePicker.tsx` | Popover + Calendar composition |
| `packages/date-picker/src/date-picker/index.ts` | date-picker surface |
| `packages/date-picker/src/index.ts` | Package entry re-exports |
| `packages/date-picker/tests/*.test.ts(x)` | Unit + component tests |
| `packages/date-picker/README.md` | Usage |
| `apps/ui-storybook/src/DatePicker.stories.tsx` | Stories |
| `README.md` | Mention date-picker if needed |

---

### Task 1: Package scaffold + tooling

**Files:**
- Modify: `packages/date-picker/package.json`
- Modify: `packages/date-picker/tsconfig.json`
- Create: `packages/date-picker/vitest.config.ts`
- Create: `packages/date-picker/tests/setup.ts`
- Create: `packages/date-picker/tests/vitest.d.ts`
- Delete or replace: `packages/date-picker/src/index.ts` placeholder as needed later

**Interfaces:**
- Consumes: popover package.json patterns
- Produces: runnable `pnpm --filter @uikit-react/date-picker test|typecheck|lint` (empty/pass)

- [ ] **Step 1: Align `package.json` with popover**

```json
{
  "name": "@uikit-react/date-picker",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "oxlint src/",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@uikit-react/popover": "workspace:*"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^7.0.0",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.7.0",
    "jsdom": "^30.0.1",
    "typescript": "^5.7.0",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: tsconfig + vitest config** (copy popover’s `vitest.config.ts` / `tests/setup.ts` / `vitest.d.ts`; set `rootDir` to `.` and `include` `src` + `tests`)

- [ ] **Step 3: Install**

Run: `pnpm install --no-frozen-lockfile`  
Expected: lockfile links `@uikit-react/date-picker` → popover

- [ ] **Step 4: Sanity**

Run: `pnpm --filter @uikit-react/date-picker typecheck`  
Expected: pass (or only missing-src errors until Task 2 adds files — keep a stub `src/index.ts` exporting `{}` if needed)

---

### Task 2: `date-string` utils (TDD)

**Files:**
- Create: `packages/date-picker/src/calendar-base/date-string.ts`
- Create: `packages/date-picker/tests/date-string.test.ts`

**Interfaces:**
- Consumes: none
- Produces:

```ts
export type DateString = string; // branded usage: YYYY-MM-DD
export type MonthString = string; // YYYY-MM

export function isValidDateString(value: string): boolean;
export function parseDateString(value: string): { y: number; m: number; d: number }; // throws if invalid
export function toDateString(y: number, m: number, d: number): DateString; // zero-pad
export function compareDateString(a: DateString, b: DateString): number; // lexicographic OK if valid
export function clampDateString(value: DateString, min?: DateString | null, max?: DateString | null): DateString;
export function toMonthString(value: DateString): MonthString;
export function addMonths(month: MonthString, delta: number): MonthString;
export function startOfMonth(month: MonthString): DateString;
export function getTodayString(): DateString; // local timezone calendar day
```

- [ ] **Step 1: Write failing tests** covering valid/invalid, `toDateString(2026, 8, 10) === '2026-08-10'`, compare, clamp, `addMonths('2026-01', -1) === '2025-12'`

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @uikit-react/date-picker test -- tests/date-string.test.ts`

- [ ] **Step 3: Implement `date-string.ts` using local `Date(y, m-1, d)` only for calendar arithmetic; never `Date.parse` of `YYYY-MM-DD` alone (UTC pitfall)**

- [ ] **Step 4: Run tests — expect PASS**

---

### Task 3: `calendar-matrix` (TDD)

**Files:**
- Create: `packages/date-picker/src/calendar-base/calendar-matrix.ts`
- Create: `packages/date-picker/tests/calendar-matrix.test.ts`

**Interfaces:**
- Consumes: `date-string` helpers
- Produces:

```ts
export interface CalendarCell {
  date: DateString;
  inCurrentMonth: boolean;
}

export function buildCalendarMatrix(
  month: MonthString,
  weekStartsOn?: number, // 0=Sun … 6=Sat, default 1
): CalendarCell[]; // length 42 (6 weeks)
```

- [ ] **Step 1: Failing tests** — August 2026 with `weekStartsOn: 1` has 42 cells; first cell is late July; includes `2026-08-01` with `inCurrentMonth: true`

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement matrix**

- [ ] **Step 4: Run — PASS**

---

### Task 4: `useCalendar` + context + Calendar compounds (TDD)

**Files:**
- Create: `packages/date-picker/src/calendar-base/types.ts`
- Create: `packages/date-picker/src/calendar-base/calendar-context.ts`
- Create: `packages/date-picker/src/calendar-base/use-calendar.ts`
- Create: `packages/date-picker/src/calendar-base/Calendar.tsx`
- Create: `packages/date-picker/src/calendar-base/index.ts`
- Create: `packages/date-picker/tests/Calendar.test.tsx`

**Interfaces:**
- Consumes: matrix + date-string
- Produces: `useCalendar`, `Calendar` (`Root`, `Header`, `PrevMonth`, `NextMonth`, `Heading`, `Grid`, `WeekDays`, `Days`, `Day`), default `<Calendar />`

`useCalendar` return (minimum):

```ts
{
  value: DateString | null;
  setValue: (d: DateString | null) => void;
  month: MonthString;
  setMonth: (m: MonthString) => void;
  cells: CalendarCell[];
  weekStartsOn: number;
  locale: string;
  isSelected: (d: DateString) => boolean;
  isDisabled: (d: DateString) => boolean;
  isToday: (d: DateString) => boolean;
  selectDate: (d: DateString) => void; // no-op if disabled
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}
```

Day button must set `data-selected` / `data-today` / `data-outside-month` / `data-disabled` as applicable.

slots (minimum): `slots.day` / `slotProps.day` optional on Day or Days renderer — can be Phase-light: support `slots.day` on `Calendar.Day` or Root; if timeboxed, implement `data-*` first and a single `slots.day` on the default Days map.

- [ ] **Step 1: Failing component tests** — render default Calendar; click a day → `onChange` with `YYYY-MM-DD`; disabled min/max not selectable; next month updates heading

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement hook + compounds + default assemble**

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Grep guard**

Run: `rg "@uikit-react/popover" packages/date-picker/src/calendar-base`  
Expected: no matches

---

### Task 5: `DatePicker` composition (TDD)

**Files:**
- Create: `packages/date-picker/src/date-picker/types.ts`
- Create: `packages/date-picker/src/date-picker/use-date-picker.ts`
- Create: `packages/date-picker/src/date-picker/DatePicker.tsx`
- Create: `packages/date-picker/src/date-picker/index.ts`
- Create: `packages/date-picker/src/index.ts`
- Create: `packages/date-picker/tests/DatePicker.test.tsx`

**Interfaces:**
- Consumes: `Calendar`, `@uikit-react/popover`
- Produces: `DatePicker`, `useDatePicker`

Default behavior:

```tsx
<DatePicker value={v} onChange={setV} placeholder="选择日期" />
```

- Trigger shows `value` or placeholder
- Opens popover; selecting a day calls `onChange` and closes (`closeOnSelect` default `true`)
- Supports `asChild` on trigger via Popover.Trigger pattern

- [ ] **Step 1: Failing tests** — closed by default; open on trigger click; select day → value + closed

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement** using `Popover.Root` / `Trigger` / `Content` + `Calendar`; Content should use library default focusManager (already safe) or pass through `slotProps`

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Package entry**

```ts
// src/index.ts
export * from './calendar-base';
export * from './date-picker';
```

---

### Task 6: README + Storybook stories

**Files:**
- Create: `packages/date-picker/README.md`
- Create: `apps/ui-storybook/src/DatePicker.stories.tsx`
- Modify: `apps/ui-storybook/package.json` — add `"@uikit-react/date-picker": "workspace:*"`
- Modify: root `README.md` if quick-start needs a date-picker note

**Interfaces:**
- Consumes: public exports from Task 5
- Produces: documented usage + Storybook stories

Stories (minimum):
1. `CalendarBasic` — Calendar + small inline `<style>` for `[data-selected]` etc.
2. `DatePickerBasic` — default DatePicker (MUI Button via asChild optional)
3. `WithMinMax`
4. `Controlled`

- [ ] **Step 1: Add workspace dependency + install**

- [ ] **Step 2: Write README** (Calendar vs DatePicker, value format, data-* table)

- [ ] **Step 3: Write stories**

- [ ] **Step 4: Verify**

Run:
```bash
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
pnpm --filter @uikit-react/ui-storybook typecheck
```

Expected: all pass

- [ ] **Step 5: Optional commit** (only if user asks)

```bash
git add packages/date-picker apps/ui-storybook pnpm-lock.yaml README.md
git commit -m "feat(date-picker): add headless calendar and popover date picker"
```

---

## Self-review (plan vs spec)

| Spec item | Task |
|-----------|------|
| YYYY-MM-DD value | Tasks 2, 4, 5 |
| calendar-base utils + matrix | Tasks 2–3 |
| Unstyled Calendar + data-* | Task 4 |
| slots (at least day) | Task 4 |
| DatePicker + popover | Task 5 |
| calendar-base no popover import | Task 4 grep |
| Storybook demos | Task 6 |
| Tests | Tasks 2–5 |
| Logical split dirs, single package | All tasks |

No physical `@uikit-react/calendar-base` package in this plan (per compromise).
