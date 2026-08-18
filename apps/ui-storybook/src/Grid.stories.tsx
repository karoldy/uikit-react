import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cell, HCell, VirtualGrid } from '@uikit-react/virtual-grid';
import '@uikit-react/virtual-grid/styles.css';
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
    <VirtualGrid
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
    </VirtualGrid>
  ),
};

export const FrozenColumns: Story = {
  render: () => (
    <VirtualGrid
      style={{ width: 360, height: 320 }}
      columns={columns}
      data={[header, ...rows.slice(0, 80)]}
    >
      {({ column, row }) => <Cell>{String(row[column.key as keyof DemoRow] ?? '')}</Cell>}
    </VirtualGrid>
  ),
};

export const VariableRowHeight: Story = {
  render: () => (
    <VirtualGrid
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
    </VirtualGrid>
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
    <VirtualGrid
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
    </VirtualGrid>
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
      <VirtualGrid
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
      </VirtualGrid>
    );
  },
};

// ---- Custom data stories (15 columns) ----

type MergeDemoRow = {
  id: number | 'header';
  fixed?: 'start' | 'end';
} & Record<string, string | number | 'start' | 'end' | undefined>;

const line = (num: number): MergeDemoRow[] => {
  return Array.from({ length: num }, (_, index) => {
    if (index === 0) {
      return {
        id: 'header',
        fixed: 'start',
        _1: '第1列表头',
        _2: '第2列表头',
        _3: '第3列表头',
        _4: '第4列表头',
        _5: '第5列表头',
        _6: '第6列表头',
        _7: '第7列表头',
        _8: '第8列表头',
        _9: '第9列表头',
        _10: '第10列表头',
        _11: '第11列表头',
        _12: '第12列表头',
        _13: '第13列表头',
        _14: '第14列表头',
        _15: '第15列表头',
      };
    }

    return {
      id: index,
      _1: `第${index}行第1列`,
      _2: `第${index}行第2列`,
      _3: `第${index}行第3列`,
      _4: `第${index}行第4列`,
      _5: `第${index}行第5列`,
      _6: `第${index}行第6列`,
      _7: `第${index}行第7列`,
      _8: `第${index}行第8列`,
      _9: `第${index}行第9列`,
      _10: `第${index}行第10列`,
      _11: `第${index}行第11列`,
      _12: `第${index}行第12列`,
      _13: `第${index}行第13列`,
      _14: `第${index}行第14列`,
      _15: `第${index}行第15列`,
    } as MergeDemoRow;
  });
};

const mergeColumns = [
  { key: '_1', width: 60, fixed: 'start' as const },
  { key: '_2', width: 60, fixed: 'start' as const },
  { key: '_3', width: 60, fixed: 'end' as const },
  { key: '_4', minWidth: 60 },
  { key: '_5', minWidth: 60 },
  { key: '_6', minWidth: 60 },
  { key: '_7', minWidth: 60 },
  { key: '_8', minWidth: 60 },
  { key: '_9', minWidth: 60 },
  { key: '_10', minWidth: 60 },
  { key: '_11', minWidth: 60 },
  { key: '_12', minWidth: 60 },
  { key: '_13', minWidth: 60 },
  { key: '_14', minWidth: 60 },
  { key: '_15', minWidth: 60 },
] as const;

export const NormalGrid: Story = {
  render: () => {
    const data = line(80);
    return (
      <VirtualGrid
        style={{ width: 720, height: 420 }}
        columns={mergeColumns as any}
        data={data}
        rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
      >
        {({ column, row }) => (
          <Cell align={{ horizontal: 'start' }}>
            {String((row as MergeDemoRow)[column.key as keyof MergeDemoRow] ?? '')}
          </Cell>
        )}
      </VirtualGrid>
    );
  },
};

export const MergeGrid: Story = {
  render: () => {
    const data = line(80);
    return (
      <VirtualGrid
        style={{ width: 720, height: 420 }}
        columns={mergeColumns as any}
        data={data}
        rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
        merge={(column, row) => {
          if (row.id === 'header') return null;
          // Merge a 2x2 rectangle: rows 1~2, columns _1~_2
          const inRows = row.id === 1 || row.id === 2;
          const inCols = column.key === '_1' || column.key === '_2';
          return inRows && inCols ? { key: 'm_grid_1' } : null;
        }}
      >
        {({ column, row, merge }) => {
          if (merge) {
            const merged = merge((info) => <Cell>{`merged-${info.key}`}</Cell>);
            if (merged) return null;
          }

          return (
            <Cell align={{ horizontal: 'start' }}>
              {String((row as MergeDemoRow)[column.key as keyof MergeDemoRow] ?? '')}
            </Cell>
          );
        }}
      </VirtualGrid>
    );
  },
};
