# Monorepo Skeleton + Toolchain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a private pnpm + Turborepo monorepo for `@uikit-react/*` with shared TypeScript/oxlint/prettier/husky/commitlint, such that `pnpm install`, `pnpm lint`, and `pnpm typecheck` succeed.

**Architecture:** Root owns workspace config, shared tooling, and Turbo orchestration. `packages/*` hold private library stubs with React 19 peerDeps; `apps/*` hold private Storybook/docs stubs without frameworks yet. Each workspace package exposes `lint` / `typecheck` / placeholder `build` (apps also placeholder `dev`).

**Tech Stack:** pnpm 10.33.0, Turborepo, TypeScript, React 19 (types + peer), oxlint, prettier, husky, lint-staged, commitlint

**Spec:** `docs/superpowers/specs/2026-08-10-monorepo-architecture-design.md`

## Global Constraints

- Package names: `@uikit-react/<name>` only
- All packages/apps: `"private": true` — no publish config
- React peer range on library packages: `^19.0.0`
- Tooling lives at repo root; packages extend `tsconfig.base.json`
- Commit messages: Conventional Commits with **required lowercase scope**
- Do **not** install Storybook, docs frameworks, or library bundlers this pass
- Commits: only when the user explicitly asks (skip commit steps otherwise)

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `pnpm-workspace.yaml` | Workspace globs for `packages/*`, `apps/*` |
| `package.json` | Root scripts, tooling deps, lint-staged, prepare |
| `turbo.json` | Task graph: lint, typecheck, build, dev |
| `tsconfig.base.json` | Shared compiler options |
| `.oxlintrc.json` | Root oxlint config |
| `.prettierrc` / `.prettierignore` | Format config |
| `commitlint.config.cjs` | Commit message rules (scope required) |
| `.gitignore` / `.gitattributes` | Ignore build artifacts; text=auto |
| `.husky/pre-commit` | `pnpm lint-staged` |
| `.husky/commit-msg` | `pnpm commitlint --edit $1` |
| `packages/*/package.json` | Private package metadata + scripts |
| `packages/*/tsconfig.json` | Extends base |
| `packages/*/src/index.ts` | Placeholder export |
| `apps/*/package.json` | Private app metadata + scripts |
| `apps/*/tsconfig.json` | Extends base |
| `apps/*/src/index.ts` | Placeholder export |
| `README.md` | Keep structure in sync; note toolchain commands |

---

### Task 1: Root workspace and ignore files

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.gitattributes`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing root `package.json` with `packageManager: pnpm@10.33.0`
- Produces: workspace-ready root `package.json` scripts shell (tooling deps added in Task 2)

- [ ] **Step 1: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules/
dist/
*.tsbuildinfo
.turbo/
.DS_Store
```

- [ ] **Step 3: Write `.gitattributes`**

```
* text=auto
```

- [ ] **Step 4: Replace root `package.json` content**

```json
{
  "name": "uikit-react",
  "version": "1.0.0",
  "private": true,
  "description": "React UI kit monorepo",
  "license": "ISC",
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "build": "turbo run build",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["oxlint", "prettier --check"],
    "*.{json,md,css,html,yml,yaml}": ["prettier --check"]
  }
}
```

- [ ] **Step 5: Verify workspace file is valid YAML and package.json parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')"`
Expected: `ok`

---

### Task 2: Shared TypeScript and quality configs

**Files:**
- Create: `tsconfig.base.json`
- Create: `.oxlintrc.json`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Create: `commitlint.config.cjs`

**Interfaces:**
- Consumes: none
- Produces: base TS options packages will extend; root lint/format/commitlint configs

- [ ] **Step 1: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 2: Write `.oxlintrc.json`**

```json
{
  "plugins": ["react", "typescript", "import", "unicorn"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {}
}
```

- [ ] **Step 3: Write `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 4: Write `.prettierignore`**

```
node_modules/
dist/
pnpm-lock.yaml
.turbo/
*.tsbuildinfo
```

- [ ] **Step 5: Write `commitlint.config.cjs`**

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci',
      ],
    ],
    'type-case': [2, 'always', 'lowercase'],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lowercase'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

- [ ] **Step 6: Sanity-check JSON configs parse**

Run: `node -e "for (const f of ['tsconfig.base.json','.oxlintrc.json','.prettierrc']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('ok')"`
Expected: `ok`

---

### Task 3: Scaffold library packages

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/hooks/package.json`
- Create: `packages/hooks/tsconfig.json`
- Create: `packages/hooks/src/index.ts`
- Create: `packages/data-table/package.json`
- Create: `packages/data-table/tsconfig.json`
- Create: `packages/data-table/src/index.ts`
- Create: `packages/date-picker/package.json`
- Create: `packages/date-picker/tsconfig.json`
- Create: `packages/date-picker/src/index.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` from Task 2
- Produces: four private packages `@uikit-react/{ui,hooks,data-table,date-picker}` each with `lint` / `typecheck` / `build` scripts

For **each** of `ui`, `hooks`, `data-table`, `date-picker`, repeat Steps 1–3 with the matching `<name>`.

- [ ] **Step 1: Write `packages/<name>/package.json`**

```json
{
  "name": "@uikit-react/<name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "oxlint src/",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "build": "node -e \"console.log('build placeholder: @uikit-react/<name>')\""
  },
  "peerDependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

If pnpm catalog is not introduced in Task 5, replace `"typescript": "catalog:"` with `"typescript": "^5.8.0"` in every package (and apps) for consistency. Prefer **catalog** only if Task 5 adds `pnpm-workspace.yaml` catalog entries; otherwise use explicit `^5.8.0` and rely on root hoisting of `typescript`.

**Preferred simpler variant (use this unless catalog is added):** omit package-level `typescript` dep; rely on root `typescript` on PATH via Turbo/`pnpm exec`. Scripts call `tsc` / `oxlint` as provided from the root after install.

Use this package.json instead (recommended for this pass):

```json
{
  "name": "@uikit-react/<name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "oxlint src/",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "build": "node -e \"console.log('build placeholder: @uikit-react/<name>')\""
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

- [ ] **Step 2: Write `packages/<name>/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write `packages/<name>/src/index.ts`**

```ts
export {};
```

- [ ] **Step 4: Confirm all four packages exist**

Run: `ls packages/ui packages/hooks packages/data-table packages/date-picker`
Expected: each directory listed without errors

---

### Task 4: Scaffold apps

**Files:**
- Create: `apps/ui-storybook/package.json`
- Create: `apps/ui-storybook/tsconfig.json`
- Create: `apps/ui-storybook/src/index.ts`
- Create: `apps/ui-docs/package.json`
- Create: `apps/ui-docs/tsconfig.json`
- Create: `apps/ui-docs/src/index.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` from Task 2
- Produces: `@uikit-react/ui-storybook`, `@uikit-react/ui-docs` with placeholder `dev` / `build`

For **each** of `ui-storybook`, `ui-docs`:

- [ ] **Step 1: Write `apps/<name>/package.json`**

```json
{
  "name": "@uikit-react/<name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node -e \"console.log('dev placeholder: @uikit-react/<name>')\"",
    "lint": "oxlint src/",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "build": "node -e \"console.log('build placeholder: @uikit-react/<name>')\""
  }
}
```

- [ ] **Step 2: Write `apps/<name>/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write `apps/<name>/src/index.ts`**

```ts
export {};
```

- [ ] **Step 4: Confirm apps exist**

Run: `ls apps/ui-storybook apps/ui-docs`
Expected: both directories listed

---

### Task 5: Install root tooling + Turbo + React types

**Files:**
- Modify: `package.json` (devDependencies via pnpm)
- Create: `turbo.json`
- Create: `pnpm-lock.yaml` (via install)

**Interfaces:**
- Consumes: workspace packages from Tasks 3–4
- Produces: lockfile; `turbo` / `tsc` / `oxlint` / hooks tooling available at root

- [ ] **Step 1: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 2: Install root devDependencies**

Run:

```bash
pnpm add -Dw turbo typescript oxlint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional react @types/react @types/react-dom
```

Expected: install completes; `node_modules` present; lockfile written

- [ ] **Step 3: Verify workspace packages are linked**

Run: `pnpm -r list --depth -1`
Expected: lists `@uikit-react/ui`, `@uikit-react/hooks`, `@uikit-react/data-table`, `@uikit-react/date-picker`, `@uikit-react/ui-storybook`, `@uikit-react/ui-docs`

---

### Task 6: Husky git hooks

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Modify: `.git/hooks` via husky prepare (side effect)

**Interfaces:**
- Consumes: root `prepare: husky`, `lint-staged`, `commitlint.config.cjs`
- Produces: working pre-commit and commit-msg hooks

- [ ] **Step 1: Initialize husky**

Run: `pnpm exec husky init`
Expected: `.husky/` directory exists (may create a default pre-commit)

- [ ] **Step 2: Overwrite `.husky/pre-commit`**

```
pnpm lint-staged
```

- [ ] **Step 3: Write `.husky/commit-msg`**

```
pnpm commitlint --edit "$1"
```

- [ ] **Step 4: Ensure hooks are executable**

Run: `chmod +x .husky/pre-commit .husky/commit-msg`

- [ ] **Step 5: Verify commitlint rejects missing scope**

Run: `echo 'feat: no scope' | pnpm commitlint`
Expected: exit non-zero (scope-empty)

- [ ] **Step 6: Verify commitlint accepts scoped message**

Run: `echo 'chore(repo): scaffold monorepo' | pnpm commitlint`
Expected: exit 0

---

### Task 7: Verify lint/typecheck/build and update README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: full toolchain from Tasks 1–6
- Produces: documented commands matching reality; green verification

- [ ] **Step 1: Run lint via Turbo**

Run: `pnpm lint`
Expected: all package `lint` tasks succeed

- [ ] **Step 2: Run typecheck via Turbo**

Run: `pnpm typecheck`
Expected: all package `typecheck` tasks succeed

- [ ] **Step 3: Run build placeholders via Turbo**

Run: `pnpm build`
Expected: all package `build` tasks succeed (placeholder logs OK)

- [ ] **Step 4: Update `README.md` toolchain section**

Keep the existing structure tables. Replace the 技术栈 / 快速开始 sections so they match this pass:

```markdown
## 技术栈

- **框架**: React 19
- **包管理器**: pnpm
- **任务编排**: Turborepo
- **语言**: TypeScript
- **质量工具**: oxlint, prettier, husky, lint-staged, commitlint

## 快速开始

\`\`\`bash
# 安装依赖
pnpm install

# 全仓 lint / typecheck
pnpm lint
pnpm typecheck

# 占位 build（真实打包下一轮）
pnpm build
\`\`\`

Storybook / 文档站命令将在接入对应 app 框架后启用。
```

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: pass (if fail, run `pnpm format` then re-check)

- [ ] **Step 6: Optional commit (only if user asks)**

```bash
git add .
git commit -m "$(cat <<'EOF'
chore(repo): scaffold pnpm turborepo monorepo

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| pnpm workspaces `packages/*` + `apps/*` | Task 1 |
| `@uikit-react/*` private packages | Tasks 3–4 |
| React 19 peerDeps on libraries | Task 3 |
| Shared TS + oxlint/prettier/commitlint | Task 2 |
| Turbo lint/typecheck/build/dev | Tasks 5, 7 |
| Husky + lint-staged + scope-required commits | Tasks 1, 6 |
| No Storybook/docs frameworks / no publish | Tasks 3–4 (placeholders only) |
| Success: install + lint + typecheck | Tasks 5, 7 |

No TBD placeholders remain after choosing the non-catalog package.json variant in Task 3.
