import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import {
  DataTable,
  Pagination,
  Table,
  usePagination,
  VirtualTable,
  type DataTableColumn,
  type TableColumn,
  type VirtualTableColumn,
} from '@uikit-react/data-table';

const meta = {
  title: 'DataTable',
  parameters: {
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
