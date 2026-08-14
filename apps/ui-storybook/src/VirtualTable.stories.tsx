import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Pagination, usePagination } from '@uikit-react/pagination';
import type { SortState } from '@uikit-react/data-table';
import { VirtualTable, type VirtualTableColumn } from '@uikit-react/virtual-table';
import '@uikit-react/virtual-table/styles.css';

const meta = {
  title: 'VirtualTable',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Workspace `@uikit-react/virtual-table` — virtualized rows and columns. Pagination is composed outside the table; there are no slots or compounds.',
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

const rowColumns: VirtualTableColumn<Row>[] = [
  { key: 'id', accessor: 'id', header: 'ID', width: 60, fixed: 'left' },
  { key: 'name', accessor: 'name', header: 'Name', flex: 1, minWidth: 140 },
  { key: 'score', accessor: 'score', header: 'Score', width: 90 },
  { key: 'status', accessor: 'status', header: 'Status', width: 110 },
];

export const Rows: Story = {
  render: () => <RowsDemo />,
};

function RowsDemo() {
  const data = useMemo(() => seed(1000), []);
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {'`<VirtualTable>`'} — 1000 rows × 4 columns, rowHeight 32, height 320. Only the visible
        range is rendered; getRowSpacing is included in the row track.
      </Typography>
      <VirtualTable
        data={data}
        columns={rowColumns}
        rowHeight={32}
        height={320}
        getRowSpacing={() => ({ top: 4, bottom: 4 })}
      />
    </Paper>
  );
}

interface WideRow {
  id: number;
  [key: string]: number | string;
}

export const Columns: Story = {
  render: () => <ColumnsDemo />,
};

function ColumnsDemo() {
  const data = useMemo(
    (): WideRow[] =>
      Array.from({ length: 3 }, (_, i) => {
        const row: WideRow = { id: i };
        for (let c = 0; c < 30; c++) {
          row[`col${c}`] = `R${i}C${c}`;
        }
        return row;
      }),
    [],
  );
  const columns: VirtualTableColumn<WideRow>[] = useMemo(
    () =>
      Array.from({ length: 30 }, (_, c) => ({
        key: `col${c}`,
        accessor: `col${c}`,
        header: `Col ${c}`,
        width: 120,
        ...(c === 0 ? { fixed: 'left' as const } : {}),
      })),
    [],
  );
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {'`<VirtualTable>`'} — 3 rows × 30 columns (width 120). Horizontal scroll recycles
        off-screen columns; the first column is frozen left.
      </Typography>
      <Box sx={{ width: 480 }}>
        <VirtualTable data={data} columns={columns} rowHeight={32} height={160} />
      </Box>
    </Paper>
  );
}

export const MultiSort: Story = {
  name: 'Multi-sort',
  render: () => <MultiSortDemo />,
};

const multiSortRows: Row[] = [
  { id: 1, name: 'Alice', score: 90, status: 'active' },
  { id: 2, name: 'Carol', score: 90, status: 'active' },
  { id: 3, name: 'Bob', score: 70, status: 'active' },
  { id: 4, name: 'Eve', score: 90, status: 'pending' },
  { id: 5, name: 'Dave', score: 70, status: 'pending' },
  { id: 6, name: 'Frank', score: 70, status: 'closed' },
  { id: 7, name: 'Gina', score: 50, status: 'closed' },
  { id: 8, name: 'Hank', score: 90, status: 'closed' },
];

function MultiSortDemo() {
  const columns: VirtualTableColumn<Row>[] = [
    { key: 'name', accessor: 'name', header: 'Name', flex: 1, minWidth: 120 },
    { key: 'status', accessor: 'status', header: 'Status', width: 110 },
    { key: 'score', accessor: 'score', header: 'Score', width: 90 },
  ];
  const [sort, setSort] = useState<SortState>([
    { columnKey: 'status', direction: 'asc' },
    { columnKey: 'score', direction: 'desc' },
  ]);
  const label =
    sort.length === 0
      ? '未排序'
      : sort.map((item, index) => `${index + 1}. ${item.columnKey} ${item.direction}`).join(' → ');
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {'`<VirtualTable multiSort>`'} — 单击追加列；同一列再点：asc → desc → 移除。也可用
        Shift+click。
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        当前：{label}
      </Typography>
      <VirtualTable
        data={multiSortRows}
        columns={columns}
        rowHeight={32}
        height={320}
        sort={sort}
        onSortChange={setSort}
        multiSort
        getRowSpacing={() => ({ top: 4, bottom: 4 })}
      />
    </Paper>
  );
}

export const WithPagination: Story = {
  name: 'With pagination',
  render: () => <WithPaginationDemo />,
};

function WithPaginationDemo() {
  const data = useMemo(() => seed(63), []);
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
        {'`<VirtualTable>`'} + {'`<Pagination>`'} — slice with usePagination, then pass the page to
        VirtualTable. Pagination is not built in.
      </Typography>
      <VirtualTable
        data={pageData}
        columns={rowColumns}
        rowHeight={32}
        height={320}
        getRowSpacing={() => ({ top: 4, bottom: 4 })}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </Stack>
  );
}
