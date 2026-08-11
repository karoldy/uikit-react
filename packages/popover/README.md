# @uikit-react/popover

基于 [@floating-ui/react](https://floating-ui.com/) 的 Popover 浮层组件。支持复合组件与 render props 两种用法。

## 安装

本包为 monorepo 私有包，在 workspace 内直接引用：

```ts
import { Popover } from '@uikit-react/popover';
```

Peer：`react` / `react-dom` ^19。

## 快速开始

### 复合组件（推荐）

```tsx
import { Popover } from '@uikit-react/popover';

export function Example() {
  return (
    <Popover.Root placement="bottom-start">
      <Popover.Trigger>打开</Popover.Trigger>
      <Popover.Content className="popover-panel">
        <p>浮层内容</p>
        <Popover.Close>关闭</Popover.Close>
      </Popover.Content>
    </Popover.Root>
  );
}
```

也可分别导入：`PopoverRoot`、`PopoverTrigger`、`PopoverContent`、`PopoverClose`。

### Render props

```tsx
import { Popover } from '@uikit-react/popover';

export function Example() {
  return (
    <Popover placement="top">
      {(api) => (
        <>
          <button {...api.getTriggerProps()}>打开</button>
          {api.open ? <div {...api.getContentProps()}>内容</div> : null}
        </>
      )}
    </Popover>
  );
}
```

### Hook

```tsx
import { usePopover } from '@uikit-react/popover';

export function Example() {
  const api = usePopover({ defaultOpen: false });
  return (
    <>
      <button {...api.getTriggerProps()}>打开</button>
      {api.open ? <div {...api.getContentProps()}>内容</div> : null}
    </>
  );
}
```

## `asChild`

`Trigger` / `Content` / `Close` 支持 `asChild`：把交互 props 合并到唯一子元素上（会合并 `className`、事件与 `ref`）。

```tsx
<Popover.Trigger asChild>
  <span role="button">自定义触发器</span>
</Popover.Trigger>
```

> 带 `arrow` 时请使用默认 `Content`（非 `asChild`），箭头需要包装层。

## Content `slots` / `slotProps`

`PopoverContent` 支持替换内部节点。`slotProps.root` 的类型会随 `slots.root` 推断：

```tsx
function Panel({
  title,
  children,
  ...rest
}: { title: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section {...rest}>
      <strong>{title}</strong>
      {children}
    </section>
  );
}

<Popover.Content
  slots={{ root: Panel }}
  slotProps={{ root: { title: '菜单' } }} // ✅ 需要 title；多余字段会报错
>
  内容
</Popover.Content>;
```

| Slot    | 默认            | 说明                             |
| ------- | --------------- | -------------------------------- |
| `root`  | `'div'`         | 定位浮层根节点                   |
| `arrow` | `FloatingArrow` | 仅在 `Popover.Root arrow` 时渲染 |

`slotProps.focusManager` 可覆盖 Floating UI 焦点行为（与库默认值合并）：

```tsx
<Popover.Content
  slotProps={{
    focusManager: {
      // 对话框式：打开时聚焦内容，失焦关闭，关闭后焦点回到触发器
      modal: true,
      initialFocus: 0,
      returnFocus: true,
      closeOnFocusOut: true,
    },
  }}
>
  ...
</Popover.Content>
```

库默认（适合普通 Popover）：`modal: false`、`initialFocus: -1`、`returnFocus: false`、`closeOnFocusOut: false`。

`asChild` 为 true 时，子元素本身就是浮层根节点，`slots.root` / `focusManager` 不生效。

若通过 `Popover.Content` 调用时泛型推断变弱，可改为直接使用具名导出 `PopoverContent`。

## 选项（`UsePopoverOptions`）

| 选项                     | 默认                           | 说明                          |
| ------------------------ | ------------------------------ | ----------------------------- |
| `defaultOpen`            | `false`                        | 非受控初始开关                |
| `open`                   | —                              | 受控开关                      |
| `onOpenChange`           | —                              | 开关变化回调                  |
| `placement`              | `'bottom-start'`               | Floating UI placement         |
| `strategy`               | `'absolute'`                   | `absolute` / `fixed`          |
| `offset`                 | `6`（有 arrow 时默认抬到 `8`） | 触发器与浮层间距              |
| `overflowPadding`        | `8`                            | 视口边缘留白                  |
| `portal`                 | `true`                         | 是否挂到 Portal               |
| `dismissible`            | `true`                         | 点击外部是否关闭              |
| `closeOnEsc`             | `true`                         | Esc 是否关闭                  |
| `arrow`                  | `false`                        | 是否显示箭头                  |
| `constrainViewport`      | `true`                         | 约束 `maxWidth` / `maxHeight` |
| `minWidth` / `minHeight` | —                              | 浮层最小尺寸（px）            |

## 脚本

```bash
pnpm --filter @uikit-react/popover test
pnpm --filter @uikit-react/popover typecheck
pnpm --filter @uikit-react/popover lint
```
