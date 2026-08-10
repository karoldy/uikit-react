---
description: Stage, commit with Conventional Commits, and push
---

# /push

Push current changes: run checks, commit with Conventional Commits (scope required), and push to remote.

## Workflow

### 1. Show current status

```bash
git status
```

### 2. Run checks on changed files

```bash
pnpm format
pnpm lint
```

If either fails, stop and report the errors.

### 3. Determine commit type and scope

Ask the user for:

- **type**: `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `revert` | `build` | `ci`
- **scope**: `ui` | `hooks` | `utils` | `date-picker` | `data-table` | `feedback-modal` | `storybook` | `docs` | `root`
- **subject**: short description (lowercase, no period at end)

Auto-detect scope based on changed files:

- `packages/ui/**` → `ui`
- `packages/hooks/**` → `hooks`
- `packages/utils/**` → `utils`
- `packages/calendar-base/**` → `calendar-base`
- `packages/rect-date-picker/**` → `rect-date-picker`
- `packages/round-date-picker/**` → `round-date-picker`
- `packages/data-table/**` → `data-table`
- `packages/feedback-modal/**` → `feedback-modal`
- `apps/ui-storybook/**` → `storybook`
- `apps/ui-docs/**` → `docs`
- Multiple packages changed or root config files → `root`

Present the auto-detected scope as the default, let the user override.

### 4. Construct and commit

```bash
git add .
git commit -m "<type>(<scope>): <subject>"
```

### 5. Push

```bash
git push origin <current-branch>
```

The current branch is `dev`. The main branch is `master` — never push directly to `master`.
