# Calendar-base Extract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Physically extract `@uikit-react/calendar-base`, reorganize both packages into `components` / `hooks` / `utils` / `types`, and hard-cut DatePicker so it no longer re-exports Calendar.

**Architecture:** Move calendar sources out of `packages/date-picker` into a new workspace package with kind-based folders. `date-picker` depends on `calendar-base` + `popover`, mirrors the same folder convention, and exports only the DatePicker surface. Storybook splits Calendar vs DatePicker stories.

**Tech Stack:** pnpm workspaces, TypeScript source exports, Vitest + Testing Library, Storybook 9 (ui-storybook)

## Global Constraints

- Package names: `@uikit-react/calendar-base`, `@uikit-react/date-picker` (both `private: true`)
- Source export: `"exports": { ".": "./src/index.ts" }` (no tsup for this extract)
- Folder convention (both packages): `src/components/`, `src/hooks/`, `src/utils/` (calendar-base only), `src/types/`
- `calendar-base` must not import `@uikit-react/popover`
- Hard cut: no Calendar / date-utils re-export from `@uikit-react/date-picker`
- Behavior unchanged — move + rewire only
- Do **not** commit unless the user explicitly asks

---

## File structure (end state)

| Path | Responsibility |
|------|----------------|
| `packages/calendar-base/package.json` | Workspace package + vitest scripts |
| `packages/calendar-base/src/utils/date-string.ts` | YYYY-MM-DD local calendar helpers |
| `packages/calendar-base/src/utils/calendar-matrix.ts` | 6×7 matrix builder |
| `packages/calendar-base/src/hooks/use-calendar.ts` | Calendar state hook |
| `packages/calendar-base/src/components/Calendar.tsx` | Unstyled Calendar compounds |
| `packages/calendar-base/src/components/calendar-context.ts` | React context |
| `packages/calendar-base/src/types/index.ts` | Shared Calendar types |
| `packages/calendar-base/src/index.ts` | Public barrel |
| `packages/date-picker/src/components/DatePicker.tsx` | Popover + Calendar composition |
| `packages/date-picker/src/hooks/use-date-picker.ts` | Open/value orchestration |
| `packages/date-picker/src/types/index.ts` | DatePicker types (imports types from calendar-base) |
| `packages/date-picker/src/index.ts` | DatePicker surface only |
| `apps/ui-storybook/src/Calendar.stories.tsx` | Calendar demos |
| `apps/ui-storybook/src/DatePicker.stories.tsx` | DatePicker demos only |

---

### Task 1: Scaffold `@uikit-react/calendar-base` + move utils

**Files:**
- Create: `packages/calendar-base/package.json`
- Create: `packages/calendar-base/tsconfig.json`
- Create: `packages/calendar-base/vitest.config.ts`
- Create: `packages/calendar-base/tests/setup.ts`
- Create: `packages/calendar-base/tests/vitest.d.ts`
- Create: `packages/calendar-base/src/utils/date-string.ts` (move from date-picker)
- Create: `packages/calendar-base/src/utils/calendar-matrix.ts` (move from date-picker)
- Create: `packages/calendar-base/tests/date-string.test.ts` (move)
- Create: `packages/calendar-base/tests/calendar-matrix.test.ts` (move)
- Create: `packages/calendar-base/src/index.ts` (utils-only exports for this task)
- Delete after move: `packages/date-picker/src/calendar-base/date-string.ts`, `calendar-matrix.ts`, and the two util tests from date-picker (or leave until Task 3 if imports would break mid-flight — prefer completing Task 2 before deleting calendar-base from date-picker)

**Interfaces:**
- Consumes: none
- Produces:

```ts
// from utils/date-string.ts — same signatures as today
export type DateString = string;
export type MonthString = string;
export function isValidDateString(value: string): boolean;
export function parseDateString(value: string): { y: number; m: number; d: number };
export function toDateString(y: number, m: number, d: number): DateString;
export function compareDateString(a: DateString, b: DateString): number;
export function clampDateString(value: DateString, min?: DateString | null, max?: DateString | null): DateString;
export function toMonthString(value: DateString): MonthString;
export function addMonths(month: MonthString, delta: number): MonthString;
export function startOfMonth(month: MonthString): DateString;
export function getTodayString(): DateString;

// from utils/calendar-matrix.ts
export interface CalendarCell { date: DateString; inCurrentMonth: boolean; }
export function buildCalendarMatrix(month: MonthString, weekStartsOn?: number): CalendarCell[];
```

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@uikit-react/calendar-base",
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

- [ ] **Step 2: Create tsconfig + vitest config**

Mirror `packages/date-picker/tsconfig.json` and `vitest.config.ts` (include `passWithNoTests: true`).

Copy `tests/setup.ts` and `tests/vitest.d.ts` from date-picker.

- [ ] **Step 3: Move util sources + tests**

```bash
mkdir -p packages/calendar-base/src/utils packages/calendar-base/tests
# Prefer `git mv` when files are tracked; otherwise cp then delete later
cp packages/date-picker/src/calendar-base/date-string.ts packages/calendar-base/src/utils/date-string.ts
cp packages/date-picker/src/calendar-base/calendar-matrix.ts packages/calendar-base/src/utils/calendar-matrix.ts
cp packages/date-picker/tests/date-string.test.ts packages/calendar-base/tests/date-string.test.ts
cp packages/date-picker/tests/calendar-matrix.test.ts packages/calendar-base/tests/calendar-matrix.test.ts
```

Fix imports inside `calendar-matrix.ts` and tests to use `./date-string` or `../src/utils/...` as appropriate (tests currently import from package paths relative to date-picker — update to e.g. `from '../src/utils/date-string'` or `from '../src/index'`).

- [ ] **Step 4: Temporary barrel**

```ts
// packages/calendar-base/src/index.ts
export * from './utils/date-string';
export * from './utils/calendar-matrix';
```

- [ ] **Step 5: Install + verify utils**

```bash
pnpm install --no-frozen-lockfile
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
```

Expected: util tests pass (same assertions as before); typecheck/lint clean.

- [ ] **Step 6: Optional commit** — only if user asks

---

### Task 2: Move Calendar components, hooks, types into calendar-base

**Files:**
- Create: `packages/calendar-base/src/types/index.ts` (from `calendar-base/types.ts`; fix imports to `../utils/...`)
- Create: `packages/calendar-base/src/hooks/use-calendar.ts`
- Create: `packages/calendar-base/src/components/calendar-context.ts`
- Create: `packages/calendar-base/src/components/Calendar.tsx`
- Create: `packages/calendar-base/tests/Calendar.test.tsx`
- Modify: `packages/calendar-base/src/index.ts` — full public exports
- Delete: entire `packages/date-picker/src/calendar-base/` after Task 3 wires date-picker (or at end of this task if Task 3 immediately follows in same session — implementer must leave date-picker temporarily broken OR finish Task 3 before claiming green monorepo)

**Interfaces:**
- Consumes: utils from Task 1
- Produces: `useCalendar`, `Calendar` (Root / Header / PrevMonth / NextMonth / Heading / Grid / WeekDays / Days / Day), types from `src/types`

- [ ] **Step 1: Move types → `src/types/index.ts`**

Update internal imports:

```ts
import type { CalendarCell } from '../utils/calendar-matrix';
import type { DateString, MonthString } from '../utils/date-string';
```

Re-export `CalendarCell` / `DateString` / `MonthString` from types barrel only if needed for convenience; prefer utils remaining source of truth for those aliases and types importing them.

- [ ] **Step 2: Move hook + context + Calendar**

Update all relative imports to `../utils/...`, `../types`, `../hooks/...`, `./calendar-context`.

Preserve behavior: `data-*` attrs, `slots.day` / `slotProps.day`, `role="rowgroup"`, composed nav `onClick`, memoized `Intl.DateTimeFormat`.

- [ ] **Step 3: Move Calendar.test.tsx**

Update imports to `@uikit-react/calendar-base` or relative `../src`.

- [ ] **Step 4: Full barrel**

```ts
// packages/calendar-base/src/index.ts
export { Calendar } from './components/Calendar';
export { useCalendar } from './hooks/use-calendar';
export * from './utils/date-string';
export * from './utils/calendar-matrix';
export type * from './types';
```

(Adjust `export type *` vs named type exports to match what `types/index.ts` exports today.)

- [ ] **Step 5: Verify calendar-base**

```bash
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
rg "@uikit-react/popover" packages/calendar-base
```

Expected: all calendar-base tests pass; grep finds no popover imports.

- [ ] **Step 6: Optional commit** — only if user asks

---

### Task 3: Rewire `date-picker` (folder convention + hard cut)

**Files:**
- Create: `packages/date-picker/src/components/DatePicker.tsx`
- Create: `packages/date-picker/src/hooks/use-date-picker.ts`
- Create: `packages/date-picker/src/types/index.ts`
- Modify: `packages/date-picker/src/index.ts`
- Modify: `packages/date-picker/package.json` — add `"@uikit-react/calendar-base": "workspace:*"`
- Modify: `packages/date-picker/tests/DatePicker.test.tsx` — imports
- Delete: `packages/date-picker/src/date-picker/`
- Delete: `packages/date-picker/src/calendar-base/` (if still present)
- Delete: moved util/Calendar tests that now live under calendar-base (keep only `DatePicker.test.tsx` + setup/vitest.d.ts)

**Interfaces:**
- Consumes: `Calendar`, `DateString`, `MonthString`, `UseCalendarOptions`, `CalendarSlots`, `CalendarSlotProps` from `@uikit-react/calendar-base`
- Consumes: `Popover` from `@uikit-react/popover`
- Produces: `DatePicker`, `useDatePicker`, DatePicker types only

- [ ] **Step 1: Add dependency**

In `packages/date-picker/package.json` `dependencies`:

```json
"@uikit-react/calendar-base": "workspace:*",
"@uikit-react/popover": "workspace:*"
```

Run: `pnpm install --no-frozen-lockfile`

- [ ] **Step 2: Move DatePicker sources into kind folders**

`DatePicker.tsx` → `src/components/DatePicker.tsx`  
`use-date-picker.ts` → `src/hooks/use-date-picker.ts`  
`types.ts` → `src/types/index.ts`

Replace relative `../calendar-base` imports with:

```ts
import { Calendar } from '@uikit-react/calendar-base';
import type {
  CalendarSlotProps,
  CalendarSlots,
  DateString,
  MonthString,
  UseCalendarOptions,
} from '@uikit-react/calendar-base';
```

- [ ] **Step 3: Hard-cut package entry**

```ts
// packages/date-picker/src/index.ts
export { DatePicker } from './components/DatePicker';
export { useDatePicker } from './hooks/use-date-picker';
export type {
  DatePickerProps,
  DatePickerSlotProps,
  UseDatePickerOptions,
  UseDatePickerReturn,
} from './types';
```

- [ ] **Step 4: Fix DatePicker tests + remove duplicate calendar tests**

Ensure `DatePicker.test.tsx` imports from `@uikit-react/date-picker` / local paths still resolve.

Remove from `packages/date-picker/tests/`: `date-string.test.ts`, `calendar-matrix.test.ts`, `Calendar.test.tsx` if still present.

- [ ] **Step 5: Verify**

```bash
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
pnpm --filter @uikit-react/calendar-base test
```

Expected: DatePicker tests pass; calendar-base still green; typecheck fails if any leftover Calendar export usage inside date-picker package.

- [ ] **Step 6: Optional commit** — only if user asks

---

### Task 4: Storybook split + workspace wiring

**Files:**
- Create: `apps/ui-storybook/src/Calendar.stories.tsx`
- Modify: `apps/ui-storybook/src/DatePicker.stories.tsx` — remove CalendarBasic; import DatePicker only from date-picker
- Modify: `apps/ui-storybook/package.json` — add `"@uikit-react/calendar-base": "workspace:*"` (keep date-picker)

**Interfaces:**
- Consumes: public barrels from both packages
- Produces: Storybook titles `Calendar` and `DatePicker`

- [ ] **Step 1: Add storybook dependency + install**

```json
"@uikit-react/calendar-base": "workspace:*"
```

```bash
pnpm install --no-frozen-lockfile
```

- [ ] **Step 2: Create Calendar.stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from '@uikit-react/calendar-base';

const meta = {
  title: 'Calendar',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const CalendarBasic: Story = {
  render: () => (
    <>
      <style>{`
        [role="grid"] button {
          width: 2.25rem;
          height: 2.25rem;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        [data-selected] { background: #1976d2; color: #fff; border-radius: 4px; }
        [data-today] { outline: 2px solid #1976d2; border-radius: 4px; }
        [data-outside-month] { opacity: 0.35; }
        [data-disabled] { opacity: 0.3; cursor: not-allowed; }
      `}</style>
      <Calendar defaultValue="2026-08-10" defaultMonth="2026-08" />
    </>
  ),
};
```

- [ ] **Step 3: Slim DatePicker.stories.tsx**

Remove `CalendarBasic` and any `Calendar` import. Keep DatePickerBasic / WithMinMax / Controlled importing from `@uikit-react/date-picker` only.

- [ ] **Step 4: Verify**

```bash
pnpm --filter @uikit-react/ui-storybook typecheck
rg "from '@uikit-react/date-picker'" apps/ui-storybook/src/Calendar.stories.tsx
# expect no matches
rg "Calendar" apps/ui-storybook/src/DatePicker.stories.tsx
# expect no Calendar component import
```

- [ ] **Step 5: Optional commit** — only if user asks

---

### Task 5: Docs + design annotation + final gate

**Files:**
- Create: `packages/calendar-base/README.md`
- Modify: `packages/date-picker/README.md` — composition only; link to calendar-base; remove Calendar import examples from date-picker
- Modify: `README.md` (root) — list both packages
- Modify: `docs/superpowers/specs/2026-08-10-date-picker-design.md` — note physical package now exists / layout superseded by extract spec

- [ ] **Step 1: Write calendar-base README**

Cover: install/workspace import, Calendar vs utils, `YYYY-MM-DD`, `data-*` table, folder layout (`components` / `hooks` / `utils` / `types`), follow-ups (keyboard / `data-focused`).

- [ ] **Step 2: Slim date-picker README**

Example must be:

```ts
import { DatePicker } from '@uikit-react/date-picker';
import { Calendar } from '@uikit-react/calendar-base'; // only if showing both in docs
```

Hard cut: primary examples for this package use DatePicker only; point Calendar readers to `@uikit-react/calendar-base`.

- [ ] **Step 3: Root README**

Add `calendar-base` to structure / package table.

- [ ] **Step 4: Annotate old design**

At top of `2026-08-10-date-picker-design.md` Non-goals / layout: add note that physical extract is specified in `2026-08-10-calendar-base-extract-design.md`.

- [ ] **Step 5: Final verification**

```bash
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
pnpm --filter @uikit-react/ui-storybook typecheck
pnpm format:check
rg "@uikit-react/popover" packages/calendar-base
# expect no matches
```

Expected: all green; no popover in calendar-base.

- [ ] **Step 6: Optional commit** — only if user asks

Suggested message if asked:

```bash
git add packages/calendar-base packages/date-picker apps/ui-storybook README.md docs pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
refactor(root): extract @uikit-react/calendar-base package

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec item | Task |
|-----------|------|
| New `@uikit-react/calendar-base` package | 1–2 |
| `components` / `hooks` / `utils` / `types` on calendar-base | 1–2 |
| Same folder convention on date-picker | 3 |
| Hard cut (no Calendar re-export) | 3 |
| calendar-base no popover | 2 grep + 5 gate |
| Storybook split | 4 |
| Docs + root README + design annotation | 5 |
| Behavior unchanged / tests moved | 1–3 |
| No tsup / no publish | Global constraints |

No placeholders remaining after authoring.
