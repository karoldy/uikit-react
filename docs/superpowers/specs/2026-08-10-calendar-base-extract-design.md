# Calendar-base Package Extract Design

**Date:** 2026-08-10  
**Status:** Approved  
**Supersedes (layout only):** logical-only split in `2026-08-10-date-picker-design.md` § Package layout / Non-goals “Physically splitting…”

## Goals

- Extract the existing `calendar-base` directory into a real workspace package `@uikit-react/calendar-base`
- Hard-cut public APIs: DatePicker consumers import Calendar / date utils from the new package only
- Keep behavior unchanged (move + rewire, not redesign)
- Split Storybook: `Calendar.stories.tsx` + `DatePicker.stories.tsx`

## Non-goals

- npm publish
- Adding a `tsup` / dist build (stay source-export like current date-picker)
- Keyboard navigation / `data-focused` (still README follow-up)
- API redesign, range selection, styling themes

## Decisions

| Topic | Choice |
|-------|--------|
| Approach | A — directory move into `packages/calendar-base` |
| Package name | `@uikit-react/calendar-base` |
| date-picker re-exports | **None** (hard cut) |
| Storybook | Separate `Calendar` and `DatePicker` story files |
| Tooling | Mirror date-picker: source `exports`, vitest, tsconfig, oxlint |
| Internal folders | `components` / `hooks` / `utils` / `types` (both packages) |

## Target layout

Internal folders by kind:

| Kind | Path | Contents |
|------|------|----------|
| Components | `src/components/` | React compounds / UI |
| Hooks | `src/hooks/` | `use*` hooks |
| Utils | `src/utils/` | pure helpers (date-string, matrix, …) |
| Types | `src/types/` | shared TypeScript types |
| Barrel | `src/index.ts` | re-export public API |

### `@uikit-react/calendar-base`

```
packages/calendar-base/
├── src/
│   ├── components/
│   │   ├── Calendar.tsx
│   │   └── calendar-context.ts
│   ├── hooks/
│   │   └── use-calendar.ts
│   ├── utils/
│   │   ├── date-string.ts
│   │   └── calendar-matrix.ts
│   ├── types/
│   │   └── index.ts          # Calendar / cell / option types
│   └── index.ts
├── tests/
│   ├── date-string.test.ts
│   ├── calendar-matrix.test.ts
│   ├── Calendar.test.tsx
│   ├── setup.ts
│   └── vitest.d.ts
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### `@uikit-react/date-picker` (same convention)

```
packages/date-picker/
├── src/
│   ├── components/
│   │   └── DatePicker.tsx
│   ├── hooks/
│   │   └── use-date-picker.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts              # DatePicker surface only (no Calendar re-export)
├── tests/
│   └── DatePicker.test.tsx
└── ...
```

Public entry remains `"." → ./src/index.ts` (no deep imports required for consumers).

## Dependency rules

- `calendar-base` → peers `react` / `react-dom`; **must not** depend on `@uikit-react/popover`
- `date-picker` → `@uikit-react/calendar-base` + `@uikit-react/popover` (`workspace:*`)
- `ui-storybook` → both packages (`workspace:*`)

## Public API

### `@uikit-react/calendar-base`

- `Calendar`, `useCalendar`, compounds / types as today
- date-string helpers + `buildCalendarMatrix` / `CalendarCell` as today

### `@uikit-react/date-picker`

- `DatePicker`, `useDatePicker`, related types only
- Internally imports Calendar APIs from `@uikit-react/calendar-base`
- **Breaking:** `import { Calendar } from '@uikit-react/date-picker'` stops working

## Storybook

| File | Title | Imports from |
|------|-------|--------------|
| `Calendar.stories.tsx` | `Calendar` | `@uikit-react/calendar-base` |
| `DatePicker.stories.tsx` | `DatePicker` | `@uikit-react/date-picker` (DatePicker stories only; drop CalendarBasic) |

## Docs updates

- New `packages/calendar-base/README.md`
- Slim `packages/date-picker/README.md` to composition + pointer to calendar-base
- Root README / monorepo notes if they mention a single date-picker package owning Calendar
- Annotate original date-picker design: physical package now exists

## Verification

```bash
pnpm install --no-frozen-lockfile
pnpm --filter @uikit-react/calendar-base test
pnpm --filter @uikit-react/calendar-base typecheck
pnpm --filter @uikit-react/calendar-base lint
pnpm --filter @uikit-react/date-picker test
pnpm --filter @uikit-react/date-picker typecheck
pnpm --filter @uikit-react/date-picker lint
pnpm --filter @uikit-react/ui-storybook typecheck
rg "@uikit-react/popover" packages/calendar-base   # expect no matches
rg "from '@uikit-react/date-picker'" apps/ui-storybook/src/Calendar.stories.tsx  # expect no matches
```

Also update `DatePicker` internals / tests to import from `@uikit-react/calendar-base` instead of relative `../calendar-base`.

## Migration note (in-repo)

Workspace-only / private packages: update Storybook + package READMEs in the same change. No published consumers to version.
