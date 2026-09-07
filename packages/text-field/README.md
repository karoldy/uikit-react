# @uikit-react/text-field

与 [MUI TextField](https://mui.com/material-ui/react-text-field/) **props 对齐** 的输入框。外观用 SCSS 实现（outlined / filled / standard），默认 `variant="outlined"`、`size="medium"`。

```ts
import { TextField, InputAdornment } from '@uikit-react/text-field';
import '@uikit-react/text-field/styles.css';
```

Peer：`react` / `react-dom` ^19。无 MUI 运行时依赖。

## 快速开始

```tsx
import { TextField } from '@uikit-react/text-field';
import '@uikit-react/text-field/styles.css';

export function Example() {
  return <TextField label="Email" helperText="We'll never share it." />;
}
```

## 常用 props

`label`、`helperText`、`error`、`disabled`、`required`、`fullWidth`、`variant`（`outlined` | `filled` | `standard`）、`size`（`medium` | `small`）、`color`、`multiline`、`minRows`、`maxRows`、`value` / `defaultValue` / `onChange`、`slotProps`。

`multiline` 且未设 `maxRows` 时，高度随内容增高；设了 `maxRows` 则长到上限后滚动。

装饰器使用 `slotProps.input`：

```tsx
<TextField
  label="Amount"
  slotProps={{
    input: {
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    },
  }}
/>
```

可通过 `--uikit-tf-accent` 等 CSS 变量覆盖主题色。

## 脚本

```bash
pnpm --filter @uikit-react/text-field test
pnpm --filter @uikit-react/text-field typecheck
pnpm --filter @uikit-react/text-field lint
pnpm --filter @uikit-react/text-field build
```
