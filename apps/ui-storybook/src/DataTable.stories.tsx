import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
  DataTable,
  Pagination,
  Table,
  usePagination,
  VirtualTable,
  type DataTableColumn,
  type TableCellSlotProps,
  type TableColumn,
  type TableHeaderCellSlotProps,
  type VirtualTableColumn,
} from '@uikit-react/data-table';
import '@uikit-react/data-table/styles.css';

const meta = {
  title: 'DataTable',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/data-table` — three table flavors (Table / DataTable / VirtualTable) sharing a ColumnBase type system, plus standalone Pagination.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

interface Row {
  id: number;
  name: string;
  score: number;
  status: string;
}

const seed = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    score: Math.floor(Math.random() * 100),
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'closed',
  }));

export const TableBasic: Story = {
  render: () => <TableBasicDemo />,
};

function TableBasicDemo() {
  const data = useMemo(() => seed(20), []);
  const columns: TableColumn<Row>[] = [
    { key: 'id', accessor: 'id', header: 'ID', width: 60, fixed: 'left' },
    { key: 'name', accessor: 'name', header: 'Name' },
    { key: 'score', accessor: 'score', header: 'Score' },
    { key: 'status', accessor: 'status', header: 'Status' },
  ];
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {'`<Table>`'} — native table, text-only cells, fixed left column.
      </Typography>
      <Table data={data} columns={columns} getRowSpacing={() => ({ top: 4, bottom: 4 })} />
    </Paper>
  );
}

export const DataTableWithPagination: Story = {
  render: () => <DataTableDemo />,
};

function DataTableDemo() {
  const data = useMemo(() => seed(63), []);
  const columns: DataTableColumn<Row>[] = [
    { key: 'id', accessor: 'id', header: 'ID', width: 60, fixed: 'left' },
    { key: 'name', accessor: 'name', header: 'Name', flex: 1, minWidth: 120 },
    { key: 'score', accessor: 'score', header: 'Score', width: 90 },
    {
      key: 'status',
      accessor: 'status',
      header: 'Status',
      width: 110,
      renderCell: ({ value }) => (
        <span style={{ color: value === 'active' ? '#2e7d32' : '#9e9e9e' }}>{String(value)}</span>
      ),
    },
  ];
  const [page, setPage] = useState(1);
  const { pageCount, start, end } = usePagination({
    total: data.length,
    pageSize: 10,
    page,
    onPageChange: setPage,
  });
  const pageData = data.slice(start, end);
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="subtitle2">
        {'`<DataTable>`'} — div-based, renderCell, flex column, external pagination.
      </Typography>
      <DataTable data={pageData} columns={columns} getRowSpacing={() => ({ top: 4, bottom: 4 })} />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </Stack>
  );
}

export const VirtualTableDemo: Story = {
  render: () => <VirtualTableDemoView />,
};

function VirtualTableDemoView() {
  const data = useMemo(() => seed(1000), []);
  const columns: VirtualTableColumn<Row>[] = [
    { key: 'id', accessor: 'id', header: 'ID', width: 60, fixed: 'left' },
    { key: 'name', accessor: 'name', header: 'Name', flex: 1, minWidth: 140 },
    { key: 'score', accessor: 'score', header: 'Score', width: 90 },
    { key: 'status', accessor: 'status', header: 'Status', width: 110 },
  ];
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {'`<VirtualTable>`'} — 1000 rows, fixed row height 32, only visible range is rendered.
      </Typography>
      <VirtualTable
        data={data}
        columns={columns}
        rowHeight={32}
        height={320}
        getRowSpacing={() => ({ top: 4, bottom: 4 })}
      />
    </Paper>
  );
}

function DemoHeaderCell({
  sorted,
  sortable: _sortable,
  label: _label,
  column: _c,
  fixed: _f,
  children,
  ...rest
}: TableHeaderCellSlotProps) {
  return (
    <div {...rest} style={{ ...rest.style, fontWeight: sorted ? 700 : 400 }}>
      {children}
    </div>
  );
}

function DemoCell({
  value,
  row: _row,
  index: _index,
  column: _column,
  children: _children,
  ...rest
}: TableCellSlotProps) {
  return (
    <div
      {...rest}
      style={{
        ...rest.style,
        borderLeft: '3px solid #1976d2',
        paddingLeft: 8,
      }}
    >
      {String(value ?? '')}
    </div>
  );
}

export const SlotAll: Story = {
  name: 'Slot / all — receive props & style',
  render: () => <SlotAllDemo />,
};

function SlotAllDemo() {
  const data = useMemo(() => seed(12), []);
  const columns: DataTableColumn<Row>[] = [
    { key: 'id', accessor: 'id', header: 'ID', width: 60, fixed: 'left' },
    { key: 'name', accessor: 'name', header: 'Name', flex: 1, minWidth: 120 },
    { key: 'score', accessor: 'score', header: 'Score', width: 90 },
    { key: 'status', accessor: 'status', header: 'Status', width: 110 },
  ];
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 640 }}>
      <Typography variant="body2" color="text.secondary">
        自定义 slot 时，DataTable 会把行为 props 注入到你的组件。默认 `uikit-dt*`
        样式只打在未替换的节点上；你自己的 slot 不会带这些 class，用下面字段自己画。
      </Typography>

      <Paper variant="outlined" sx={{ p: 1.5, width: '100%' }}>
        <Typography variant="subtitle2" gutterBottom>
          显式状态 props（DataTable 不注入 aria-* / data-* / role）
        </Typography>
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2,
            typography: 'caption',
            color: 'text.secondary',
            '& code': { fontSize: '0.75rem' },
          }}
        >
          <li>
            <code>headerCell</code>：<code>sorted</code> <code>sortable</code> <code>label</code>{' '}
            <code>column</code> <code>fixed</code>
          </li>
          <li>
            <code>cell</code>：<code>value</code> <code>row</code> <code>index</code>{' '}
            <code>column</code>
          </li>
          <li>
            本例只替换了 <code>headerCell</code> / <code>cell</code>
            ，表头行与数据行仍走基础样式；点击表头可排序
          </li>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, width: '100%' }}>
        <DataTable
          data={data}
          columns={columns}
          defaultSort={{ columnKey: 'name', direction: 'asc' }}
          getRowSpacing={() => ({ top: 4, bottom: 4 })}
          slots={{
            headerCell: DemoHeaderCell,
            cell: DemoCell,
          }}
        />
      </Paper>
    </Stack>
  );
}
