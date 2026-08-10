# uikit-react

基于 React 的 UI 组件库 monorepo。

## 项目结构

```
uikit-react/
├── packages/
│   ├── ui/            # 核心 UI 组件
│   ├── hooks/         # 通用 React Hooks
│   ├── data-table/    # 数据表格组件
│   └── date-picker/   # 日期选择器组件
├── apps/
│   ├── ui-storybook/  # 组件 Storybook 演示
│   └── ui-docs/       # 组件文档站点
└── package.json
```

## Packages

| 包名          | 描述                  |
| ------------- | --------------------- |
| `ui`          | 核心 UI 组件库        |
| `hooks`       | 通用 React Hooks 集合 |
| `data-table`  | 数据表格组件          |
| `date-picker` | 日期选择器组件        |

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

# 占位 build（真实打包下一轮）
pnpm build
```

Storybook / 文档站命令将在接入对应 app 框架后启用。

## 许可证

ISC
