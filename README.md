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

| 包名 | 描述 |
|------|------|
| `ui` | 核心 UI 组件库 |
| `hooks` | 通用 React Hooks 集合 |
| `data-table` | 数据表格组件 |
| `date-picker` | 日期选择器组件 |

## Apps

| 应用 | 描述 |
|------|------|
| `ui-storybook` | 组件开发与演示（Storybook） |
| `ui-docs` | 组件文档站点 |

## 技术栈

- **框架**: React
- **包管理器**: pnpm
- **构建工具**: （待定）
- **语言**: TypeScript

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 Storybook
pnpm --filter ui-storybook dev

# 启动文档站点
pnpm --filter ui-docs dev
```

## 许可证

ISC
