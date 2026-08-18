import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cell, Grid, HCell } from '@uikit-react/virtual-table';
import '@uikit-react/virtual-table/styles.css';
import { useSorting, type SortState, type SortableColumn } from '@uikit-react/hooks';
import { useState } from 'react';

const meta = {
  title: 'Grid',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Absolute-position virtual grid ported from uikit Grid. Header rows use `fixed: "start"` on row data.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

interface DemoRow {
  id: number;
  name: string;
  score: number;
  fixed?: 'start' | 'end';
}

const columns = [
  { key: 'id', width: 80, fixed: 'start' as const },
  { key: 'name', width: 160 },
  { key: 'score', width: 100, fixed: 'end' as const },
];

const header: DemoRow = { id: -1, name: 'Name', score: 0, fixed: 'start' };
const rows: DemoRow[] = Array.from({ length: 200 }, (_, id) => ({
  id,
  name: `User ${id}`,
  score: (id * 7) % 100,
}));

export const Basic: Story = {
  render: () => (
    <Grid
      style={{ width: 640, height: 420 }}
      columns={columns}
      data={[header, ...rows]}
      rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
    >
      {({ column, row }) => (
        <Cell align={{ horizontal: 'start' }}>
          {row.fixed === 'start' && column.key === 'name'
            ? 'Name'
            : row.fixed === 'start' && column.key === 'score'
              ? 'Score'
              : String(row[column.key as keyof DemoRow] ?? '')}
        </Cell>
      )}
    </Grid>
  ),
};

export const FrozenColumns: Story = {
  render: () => (
    <Grid
      style={{ width: 360, height: 320 }}
      columns={columns}
      data={[header, ...rows.slice(0, 80)]}
    >
      {({ column, row }) => <Cell>{String(row[column.key as keyof DemoRow] ?? '')}</Cell>}
    </Grid>
  ),
};

export const VariableRowHeight: Story = {
  render: () => (
    <Grid
      style={{ width: 640, height: 420 }}
      columns={columns}
      data={[header, ...rows.slice(0, 60)]}
      rowHeight={(row) => (row.id % 5 === 0 ? 56 : 32)}
    >
      {({ column, row }) => (
        <Cell align={{ vertical: row.id % 5 === 0 ? 'start' : 'center' }}>
          {String(row[column.key as keyof DemoRow] ?? '')}
        </Cell>
      )}
    </Grid>
  ),
};

const sortableColumns: SortableColumn<DemoRow>[] = [
  { key: 'name', accessor: 'name', sortable: true },
  { key: 'score', accessor: 'score', sortable: true },
];

function SortableHeadersContent() {
  const columns = [
    { key: 'name', width: 220 },
    { key: 'score', width: 140 },
  ] as const;

  const header = {
    id: -1,
    name: 'Name',
    score: 0,
    fixed: 'start' as const,
  } satisfies DemoRow;

  const body = rows.map((r) => ({ ...r, fixed: undefined }));

  const [sort, setSort] = useState<SortState>([]);

  const { sortedRows } = useSorting({
    data: body,
    columns: sortableColumns,
    sort,
    onSortChange: setSort,
  });

  return (
    <Grid
      style={{ width: 640, height: 420 }}
      columns={columns}
      data={[header, ...sortedRows]}
      rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
    >
      {({ column, row }) => {
        if (row.fixed === 'start') {
          return (
            <HCell name={column.key} sort={sort} onSortChange={setSort}>
              {column.key === 'name' ? 'Name' : 'Score'}
            </HCell>
          );
        }

        return <Cell>{String(row[column.key as keyof DemoRow] ?? '')}</Cell>;
      }}
    </Grid>
  );
}

export const SortableHeaders: Story = {
  render: () => <SortableHeadersContent />,
};

export const MergingCells: Story = {
  render: () => {
    const columns = [
      { key: 'name', width: 260 },
      { key: 'score', width: 140 },
    ] as const;

    const header = { id: -1, name: 'Name', score: 0, fixed: 'start' as const } satisfies DemoRow;
    const body = rows.slice(0, 12).map((r) => ({ ...r, fixed: undefined }));

    return (
      <Grid
        style={{ width: 640, height: 360 }}
        columns={columns}
        data={[header, ...body]}
        rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
        merge={(column, row) => {
          if (row.fixed === 'start') return null;

          const inBlock = row.id >= 0 && row.id <= 1;
          const inColumns = column.key === 'name' || column.key === 'score';
          return inBlock && inColumns ? { key: 'm1' } : null;
        }}
      >
        {({ column, row, merge }) => {
          if (merge) {
            const merged = merge((info) => <Cell>{`merged-${info.key}`}</Cell>);
            if (merged) return null;
          }

          return <Cell>{String(row[column.key as keyof DemoRow] ?? '')}</Cell>;
        }}
      </Grid>
    );
  },
};

// GridPanel 组件已删除（本 spec 的 v3 组合还在后续阶段）
