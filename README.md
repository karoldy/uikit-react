# uikit-react

基于 React 的 UI 组件库 monorepo。

## 项目结构

```
uikit-react/
├── packages/
│   ├── hooks/         # 通用 React Hooks
│   ├── popover/       # Popover 浮层
│   ├── calendar-base/ # 无样式日历网格与日期工具
│   ├── data-table/    # 数据表格组件
│   └── date-picker/   # 弹出式日期选择器
├── apps/
│   ├── ui-storybook/  # 组件 Storybook 演示
│   └── ui-docs/       # 组件文档站点
└── package.json
```

## Packages

| 包名            | 描述                             |
| --------------- | -------------------------------- |
| `hooks`         | 通用 React Hooks 集合            |
| `popover`       | Popover 浮层组件                 |
| `calendar-base` | 无样式日历网格与日期工具         |
| `data-table`    | 数据表格组件                     |
| `date-picker`   | 弹出式日期选择器（Popover 组合） |

## Apps

| 应用           | 描述                        |
| -------------- | --------------------------- |
| `ui-storybook` | 组件开发与演示（Storybook） |
| `ui-docs`      | 组件文档站点                |

## 技术栈

- **框架**: React 19
- **包管理器**: pnpm
- **任务编排**: Turborepo
- **语言**: TypeScript
- **质量工具**: oxlint, prettier, husky, lint-staged, commitlint

## 快速开始

```bash
# 安装依赖
pnpm install

# 全仓 lint / typecheck
pnpm lint
pnpm typecheck

# Storybook（Popover、DatePicker 等组件演示）
pnpm --filter @uikit-react/ui-storybook dev
# → http://localhost:6006
```

## 许可证

ISC
