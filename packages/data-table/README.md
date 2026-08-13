# @uikit-react/data-table

三个表格入口，共用同一套 compounds：`Table`（原生 `<table>`）、`DataTable`（`div`）、`VirtualTable`（`div` + 固定 `rowHeight` 的虚拟 Body）。

默认 import `styles.css` 后，未替换的节点会挂 `uikit-dt*` class（边框、表头底）。你自己提供的 slot **不会**带这些 class。`disableDefaultStyles` 可关掉全部默认 class。分页是独立组件，不接进表格内部。

## 安装

```ts
import { Table, DataTable, VirtualTable, Pagination, usePagination } from '@uikit-react/data-table';
import '@uikit-react/data-table/styles.css';
```

Peer：`react` ^19。

## 目录

```
src/
├── components/   # Table / DataTable / VirtualTable、compounds、Pagination
├── hooks/        # useSorting、usePagination、useVirtualRows
├── utils/        # sort、paginate、virtual-range、sticky、getValue
├── styles/       # data-table.css（tsup 后 → dist/styles.css）
├── types/
└── index.ts
```

## 快速开始

```tsx
import { DataTable, Pagination, Table, usePagination, VirtualTable } from '@uikit-react/data-table';
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

<VirtualTable
  data={rows}
  columns={[{ key: 'name', accessor: 'name', header: 'Name', flex: 1 }]}
  rowHeight={32}
  height={320}
  overscan={5}
/>;
```

- `Table`：原生 `<table>` / `<th>` / `<td>`，单元格纯文本
- `DataTable`：`div` 网格，支持 `renderCell` / `renderHeaderCell` / `flex`
- `VirtualTable`：同 `div`，`rowHeight` 必填；`Body` 只渲染可见行。列需 `width` 或 `flex` 二选一。`height` 默认 `300`，`overscan` 默认 `5`

排序点击循环：无排序 → `asc` → `desc` → 无排序。默认不画 ↑/↓；未排序无内边框，升序上边、降序下边（`--uikit-dt-sort` 粉色）。仍可通过 `renderSortIndicator` 自定义符号。受控：`sort` + `onSortChange`；非受控：`defaultSort`。

## Compounds

三个入口挂同一套 compounds：`Root` / `Header` / `HeaderRow` / `HeaderCell` / `Body` / `Row` / `Cell`（如 `Table.Root`、`DataTable.HeaderCell`、`VirtualTable.Body`）。默认 `<Table />` 等会渲染 Header + Body。

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

`root` · `header` · `headerRow` · `headerCell` · `body` · `row` · `cell`

自定义 slot 组件会收到显式状态；内置 `'div'` / `'th'` / `'td'` **不会**把这些字段写到 DOM。

| Slot         | 类型                       | 显式状态                                     |
| ------------ | -------------------------- | -------------------------------------------- |
| `headerCell` | `TableHeaderCellSlotProps` | `sorted` `sortable` `column` `label` `fixed` |
| `row`        | `TableRowSlotProps`        | `row` `index`                                |
| `cell`       | `TableCellSlotProps`       | `row` `index` `column` `value`               |

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

默认 import `styles.css` 后会挂 `uikit-dt*` class。自定义 slot 默认不挂；`disableDefaultStyles` 连内置节点的 class 也关掉。

### CSS 变量

| 变量                   | 用途           |
| ---------------------- | -------------- |
| `--uikit-dt-fg`        | 前景色         |
| `--uikit-dt-border`    | 单元格边框     |
| `--uikit-dt-header-bg` | 表头底         |
| `--uikit-dt-cell-pad`  | 单元格 padding |
| `--uikit-dt-sort`      | 表头排序内边框 |

### 主要 class

`uikit-dt` · `__header` · `__header-row` · `__header-cell` · `__header-cell--sorted-asc` · `__header-cell--sorted-desc` · `__body` · `__row` · `__cell`

表格组件**不**注入 `aria-*` / `role` / `data-*`；无障碍由调用方在 slot 上自行决定（与 Calendar 相同）。

## 间距

`getRowSpacing={({ row, index }) => ({ top, bottom })}` 控制行上下 padding：

- 原生 `Table`：padding 打在 Cell（`td`）
- `div` 的 `DataTable` / `VirtualTable`：padding 打在 Row

## 分页

`Pagination` + `usePagination` 独立存在，**不**接进表格。对切片后的数据再传给表格：

```tsx
const { page, pageCount, start, end, setPage } = usePagination({
  total: rows.length,
  pageSize: 10,
});

<DataTable data={rows.slice(start, end)} columns={columns} />
<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
```

## 导出

| 导出                                   | 说明                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `Table` / `DataTable` / `VirtualTable` | 三个入口 + compounds                                                     |
| `Pagination` / `usePagination`         | 外部分页                                                                 |
| `useSorting` / `useVirtualRows`        | 无头 hooks                                                               |
| types                                  | `TableColumn` / `DataTableColumn` / `VirtualTableColumn` / slot props 等 |

## 脚本

```bash
pnpm --filter @uikit-react/data-table test
pnpm --filter @uikit-react/data-table typecheck
pnpm --filter @uikit-react/data-table lint
```
