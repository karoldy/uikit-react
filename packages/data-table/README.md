# @uikit-react/data-table

两个表格入口，共用同一套 compounds：`Table` 与 `DataTable` 都是 `div` 网格。`Table` 单元格纯文本；`DataTable` 支持 `renderCell` / `flex`。虚拟化在独立包 `@uikit-react/virtual-table`，不从本包 re-export。

默认 import `styles.css` 后，未替换的节点会挂 `uikit-dt*` class（边框、表头底）。你自己提供的 slot **不会**带这些 class。`disableDefaultStyles` 可关掉全部默认 class。分页是独立组件，不接进表格内部。

## 安装

```ts
import { Table, DataTable, Pagination, usePagination } from '@uikit-react/data-table';
import '@uikit-react/data-table/styles.css';
```

Peer：`react` ^19。

## 目录

```
src/
├── components/   # Table / DataTable、compounds
├── utils/        # sticky、cx、column-style
├── styles/       # data-table.scss（tsup + esbuild-sass-plugin → dist/styles.css）
├── types/
└── index.ts
```

## 快速开始

```tsx
import { DataTable, Pagination, Table, usePagination } from '@uikit-react/data-table';
import '@uikit-react/data-table/styles.css';

const columns = [
  { key: 'name', accessor: 'name', header: 'Name' },
  { key: 'score', accessor: 'score', header: 'Score', width: 80 },
];

<Table data={rows} columns={columns} />;

<DataTable
  data={rows}
  columns={[
    { key: 'name', accessor: 'name', header: 'Name', flex: 1 },
    {
      key: 'score',
      accessor: 'score',
      header: 'Score',
      width: 80,
      renderCell: ({ value }) => <b>{String(value)}</b>,
    },
  ]}
/>;
```

- `Table`：`div` 网格，单元格纯文本。未指定 `width` 的列均分剩余宽度
- `DataTable`：`div` 网格，支持 `renderCell` / `renderHeaderCell` / `flex`

虚拟滚动请用 `@uikit-react/virtual-table`。

排序点击循环：无排序 → `asc` → `desc` → 无排序。单击只排一列（点另一列会替换）；**Shift+click** 或 `multiSort` 追加多列，数组顺序即优先级。`onSortChange` 始终回调 `SortItem[]`；`sort` / `defaultSort` 仍接受旧版 `{ columnKey, direction }`。默认不画 ↑/↓；未排序无内边框，升序上边、降序下边（`--uikit-dt-sort` 粉色）。仍可通过 `renderSortIndicator` 自定义符号。

## Compounds

两个入口挂同一套 compounds：`Root` / `Header` / `HeaderRow` / `HeaderCell` / `Body` / `Row` / `Cell`（如 `Table.Root`、`DataTable.HeaderCell`）。默认 `<Table />` 等会渲染 Header + Body。

```tsx
<DataTable.Root data={rows} columns={columns}>
  <DataTable.Header>
    <DataTable.HeaderRow />
  </DataTable.Header>
  <DataTable.Body />
</DataTable.Root>
```

自行拆行时：`HeaderCell` / `Cell` 用 `columnKey`；`Row` 用 `index`。

## Slots

`root` · `header` · `headerRow` · `headerCell` · `body` · `row` · `cell` · `loadingRow` · `loadingCell` · `loadingLine` · `loadingSpin`

自定义 slot 组件会收到显式状态；内置 `'div'` **不会**把这些字段写到 DOM。

| Slot          | 类型                        | 显式状态                                     |
| ------------- | --------------------------- | -------------------------------------------- |
| `headerCell`  | `TableHeaderCellSlotProps`  | `sorted` `sortable` `column` `label` `fixed` |
| `row`         | `TableRowSlotProps`         | `row` `index`                                |
| `cell`        | `TableCellSlotProps`        | `row` `index` `column` `value`               |
| `loadingRow`  | `TableLoadingRowSlotProps`  | `count` `columns`                            |
| `loadingCell` | `TableLoadingCellSlotProps` | `count` `columns`                            |

请把状态字段解构掉，勿整包 spread 到原生 DOM。

```tsx
function MyHeaderCell({
  sorted,
  sortable: _sortable,
  column: _column,
  label: _label,
  fixed: _fixed,
  children,
  ...rest
}: TableHeaderCellSlotProps) {
  return (
    <div {...rest} style={{ ...rest.style, fontWeight: sorted ? 700 : 400 }}>
      {children}
    </div>
  );
}

<DataTable slots={{ headerCell: MyHeaderCell }} data={rows} columns={columns} />;
```

未替换的 Header / Row 仍走基础样式；`MyHeaderCell` 上没有 `uikit-dt__header-cell`。若要关掉整表默认 class：

```tsx
<DataTable
  disableDefaultStyles
  slots={{ headerCell: MyHeaderCell }}
  data={rows}
  columns={columns}
/>
```

## 样式

默认 import `styles.css` 后会挂 `uikit-dt*` class。自定义 slot 默认不挂；`disableDefaultStyles` 连内置节点的 class 也关掉。`.uikit-dt` 是滚动容器：`height: 100%` 撑满父级、`overflow: auto`、`overscroll-behavior: none`。外层只需要定高度，不要自己再设 overflow。外边框画在 root 上，所以父级定高后底部仍能看到框线，滚动条也在表格上。

单元格边框默认开启，相邻边合并为 1px。`bordered={false}` 关闭（root 会挂 `uikit-dt--borderless`）。

### CSS 变量

| 变量                   | 用途               |
| ---------------------- | ------------------ |
| `--uikit-dt-fg`        | 前景色             |
| `--uikit-dt-bg`        | 单元格底（冻结列） |
| `--uikit-dt-border`    | 单元格边框         |
| `--uikit-dt-header-bg` | 表头底             |
| `--uikit-dt-cell-pad`  | 单元格 padding     |
| `--uikit-dt-sort`      | 表头排序内边框     |
| `--uikit-dt-loading`   | 表头 loading 线    |

### 主要 class

`uikit-dt` · `uikit-dt--borderless` · `__header` · `__header-row` · `__header-cell` · `__header-cell--sorted-asc` · `__header-cell--sorted-desc` · `__header-cell--frozen` · `__header-cell--frozen-left` · `__header-cell--frozen-right` · `__body` · `__row` · `__row--spaced` · `__row--skeleton` · `__cell` · `__cell--frozen` · `__cell--frozen-left` · `__cell--frozen-right` · `__skeleton` · `__skeleton--row` · `__loading-line` · `__spin` · `__spin-icon`

表格组件**不**注入 `aria-*` / `role` / `data-*`；无障碍由调用方在 slot 上自行决定（与 Calendar 相同）。

## 间距

`getRowSpacing={({ row, index }) => ({ top, bottom })}` 控制行上下 margin，打在 Row 上。

## Loading

`loading` 四种：`row` 整行骨架、`cell` 按单元格骨架、`line` 表头底部运动线、`spin` Body 中央转圈。

- 无数据：`row` / `cell` / `spin`（传 `line` 会回退成 `row`）
- 有数据：四种都可用。`line` / `spin` 保留现有行；`row` / `cell` 用骨架替换 body（行数默认等于 `data.length`）

`skeletonRows` 可改骨架行数。无数据时默认 12。四种 loading UI 都是 slot，可整块替换：

```tsx
function MySpin({ children: _icon, ...rest }: TableLoadingSpinSlotProps) {
  return (
    <div {...rest}>
      <span className="my-spinner" />
    </div>
  );
}

<Table data={rows} columns={columns} loading="spin" slots={{ loadingSpin: MySpin }} />;
```

```tsx
<Table data={[]} columns={columns} loading="row" />
<Table data={[]} columns={columns} loading="cell" skeletonRows={8} />
<DataTable data={rows} columns={columns} loading="line" />
<DataTable data={rows} columns={columns} loading="spin" />
```

## 分页

实现已迁到 `@uikit-react/pagination`，data-table 为兼容 re-export。`Pagination` + `usePagination` 独立存在，**不**接进表格。对切片后的数据再传给表格：

```tsx
const { page, pageCount, start, end, setPage } = usePagination({
  total: rows.length,
  pageSize: 10,
});

<DataTable data={rows.slice(start, end)} columns={columns} />
<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
```

## 导出

| 导出                           | 说明                                              |
| ------------------------------ | ------------------------------------------------- |
| `Table` / `DataTable`          | 两个入口 + compounds                              |
| `Pagination` / `usePagination` | 外部分页（re-export `@uikit-react/pagination`）   |
| `useSorting`                   | 无头 hook（re-export `@uikit-react/hooks`）       |
| types                          | `TableColumn` / `DataTableColumn` / slot props 等 |

## 脚本

```bash
pnpm --filter @uikit-react/data-table test
pnpm --filter @uikit-react/data-table typecheck
pnpm --filter @uikit-react/data-table lint
```
