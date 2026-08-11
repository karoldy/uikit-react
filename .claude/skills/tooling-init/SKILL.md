---
name: tooling-init
description: Initialize a TypeScript/JavaScript project with oxlint, prettier, husky, lint-staged, and commitlint
---

# tooling-init

Bootstrap a new TypeScript or JavaScript project with a complete engineering toolchain.

## What it sets up

| Tool        | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| TypeScript  | Type checking and compilation                               |
| oxlint      | Fast linter (react + typescript + import + unicorn plugins) |
| Prettier    | Code formatter                                              |
| Husky       | Git hooks manager                                           |
| lint-staged | Run linters only on staged files                            |
| commitlint  | Enforce Conventional Commits (scope required)               |

## Workflow

### 1. Confirm target directory

Ask the user which directory to initialize. Default to the current working directory.

### 2. Initialize package.json

If `package.json` does not exist, create one:

```bash
npm init -y
```

If it exists, read it to understand the current state before modifying.

### 3. Install dependencies

```bash
pnpm add -D typescript oxlint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 4. Write config files

Create the following files in the project root:

**`.oxlintrc.json`**:

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

**`.prettierrc`**:

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

**`.prettierignore`**:

```
node_modules/
dist/
pnpm-lock.yaml
*.tsbuildinfo
```

**`commitlint.config.cjs`**:

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

**`.gitattributes`**:

```
* text=auto
```

**`.gitignore`**:

```
node_modules/
dist/
*.tsbuildinfo
```

**`tsconfig.json`** (if TypeScript was installed and the file does not exist):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 5. Add scripts to package.json

Add or update these scripts in `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "lint": "oxlint src/",
    "lint:fix": "oxlint --fix src/",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["oxlint", "prettier --check"],
    "*.{json,md,css,html}": ["prettier --check"]
  }
}
```

If the `package.json` already has scripts, merge the new ones without overwriting existing unrelated scripts.

### 6. Initialize husky

```bash
pnpm exec husky init
```

This creates the `.husky/` directory with a default `pre-commit` hook.

### 7. Create husky hooks

Overwrite `.husky/pre-commit`:

```
pnpm lint-staged
```

Create `.husky/commit-msg`:

```
pnpm commitlint --edit $1
```

Make both hooks executable:

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

### 8. Run pnpm install

```bash
pnpm install
```

This triggers the `prepare` script, which runs `husky` to install the git hooks.

### 9. Create src/index.ts

If `src/` does not exist, create `src/index.ts` with a placeholder export so `tsc` and `oxlint` have something to check:

```ts
export {};
```

### 10. Summarize

Print a summary of what was set up and the available commands:

| Command             | Action                                      |
| ------------------- | ------------------------------------------- |
| `pnpm build`        | Compile TypeScript                          |
| `pnpm lint`         | Run oxlint                                  |
| `pnpm lint:fix`     | Auto-fix lint issues                        |
| `pnpm format`       | Format all files                            |
| `pnpm format:check` | Check formatting (CI)                       |
| `git commit`        | Automatically runs lint-staged + commitlint |

Commit format: `<type>(<scope>): <subject>` — scope is required.
