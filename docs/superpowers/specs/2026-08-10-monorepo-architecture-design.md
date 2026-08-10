# Monorepo Architecture Design

**Date:** 2026-08-10  
**Status:** Approved (implementation pending)  
**Scope:** Skeleton + engineering toolchain (no runnable Storybook/docs yet)

## Goals

Create a pnpm + Turborepo monorepo for a React 19 UI kit with:

- Workspace layout matching the project README
- Shared TypeScript and lint/format/git-hook toolchain
- Turbo task graph for `lint` / `typecheck` (and placeholder `build` / `dev`)
- All packages private — nothing published

## Non-goals (this pass)

- Runnable Storybook or docs site
- Real UI components
- Library bundling / publish pipeline / changesets
- Test framework setup

## Decisions

| Topic | Choice |
|-------|--------|
| Package manager | pnpm (`packageManager: pnpm@10.33.0`) |
| Task runner | Turborepo on top of pnpm workspaces |
| Package names | `@uikit-react/*` |
| Publish | All `private: true` |
| React | 19 (`peerDependencies` on library packages) |
| Tooling | oxlint, prettier, husky, lint-staged, commitlint (from `tooling-init`, adapted for monorepo) |

## Directory layout

```
uikit-react/
├── apps/
│   ├── ui-storybook/          # @uikit-react/ui-storybook
│   └── ui-docs/               # @uikit-react/ui-docs
├── packages/
│   ├── ui/                    # @uikit-react/ui
│   ├── hooks/                 # @uikit-react/hooks
│   ├── data-table/            # @uikit-react/data-table
│   └── date-picker/           # @uikit-react/date-picker
├── pnpm-workspace.yaml
├── package.json
├── turbo.json
├── tsconfig.base.json
├── .oxlintrc.json
├── .prettierrc
├── .prettierignore
├── commitlint.config.cjs
├── .gitattributes
├── .gitignore
├── .husky/
└── README.md
```

### Workspace globs

`pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## Package conventions

### Libraries (`packages/*`)

```
packages/<name>/
├── package.json
├── tsconfig.json      # extends ../../tsconfig.base.json
└── src/
    └── index.ts       # `export {}` placeholder
```

- `name`: `@uikit-react/<name>`
- `private: true`
- `peerDependencies`: `{ "react": "^19.0.0" }` on packages that will ship React code (`ui`, `hooks`, `data-table`, `date-picker`)
- Scripts: `lint` (oxlint `src/`), `typecheck` (`tsc --noEmit`), `build` (placeholder success for now)
- Inter-package `workspace:*` deps (e.g. data-table → ui/hooks) are **not** required this pass

### Apps (`apps/*`)

```
apps/<name>/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts       # placeholder only
```

- `private: true`
- Scripts: `lint`, `typecheck`, placeholder `dev` / `build` (no Storybook/docs frameworks installed this pass)

## Tooling

### TypeScript

- Root `tsconfig.base.json`: `strict`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `skipLibCheck`, `forceConsistentCasingInFileNames`
- Each package/app extends base; `include: ["src"]`
- Root may hold `react` / `@types/react` / `@types/react-dom` as devDependencies so typecheck resolves peers

### Lint / format / hooks

- **oxlint** + **prettier** configs at repo root
- **lint-staged** on root: TS/TSX → oxlint + prettier check; json/md/css/html → prettier check
- **husky**: `pre-commit` → `pnpm lint-staged`; `commit-msg` → `pnpm commitlint --edit $1`
- **commitlint**: Conventional Commits; **scope required**; lowercase scope (e.g. `ui`, `hooks`, `repo`, `storybook`)

### Turborepo

`turbo.json` pipeline (minimum):

| Task | Behavior this pass |
|------|--------------------|
| `lint` | Run package `oxlint` |
| `typecheck` | Run `tsc --noEmit` |
| `build` | Placeholder; depends on `^build` when real builds exist |
| `dev` | Placeholder / persistent-capable for later Storybook |

Root scripts:

- `pnpm lint` → `turbo run lint`
- `pnpm typecheck` → `turbo run typecheck`
- `pnpm build` → `turbo run build`
- `pnpm format` / `pnpm format:check` → prettier at root
- `prepare` → `husky`

## Success criteria

1. `pnpm install` succeeds
2. `pnpm lint` and `pnpm typecheck` pass via Turbo across all packages/apps
3. Directory layout matches README package/app list
4. Invalid commit messages / unformatted staged files are blocked by hooks
5. No publish config or registry workflow is introduced

## Follow-ups (out of scope)

- Wire Storybook in `apps/ui-storybook`
- Wire docs site in `apps/ui-docs`
- Real components in `packages/ui` and related packages
- Replace placeholder `build` with a real library bundler
- Optional: Changesets if publishing is ever needed
