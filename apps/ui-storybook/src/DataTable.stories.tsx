import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import {
  DataTable,
  Pagination,
  Table,
  usePagination,
  type DataTableColumn,
  type SortState,
  type TableCellSlotProps,
  type TableColumn,
  type TableHeaderCellSlotProps,
  type TableLoading,
  type TableRowSlotProps,
} from '@uikit-react/data-table';
import '@uikit-react/data-table/styles.css';

const meta = {
  title: 'DataTable',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`@uikit-react/data-table` — `Table` and `DataTable` are both div grids with shared compounds and slots. `Table` is text-only cells; `DataTable` adds `renderCell` / `flex`. Pagination is composed outside the table.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

type Status = 'selected' | 'waitlist' | 'passed';

interface Film {
  id: number;
  title: string;
  director: string;
  runtime: number;
  score: number;
  status: Status;
}

const FILMS: Film[] = [
  {
    id: 12,
    title: 'Night Orchard',
    director: 'Lena Voss',
    runtime: 104,
    score: 92,
    status: 'selected',
  },
  {
    id: 18,
    title: 'Dock Glass',
    director: 'Omar Ricci',
    runtime: 89,
    score: 88,
    status: 'selected',
  },
  { id: 21, title: 'Salt Choir', director: 'Mei Tan', runtime: 121, score: 81, status: 'waitlist' },
  {
    id: 24,
    title: 'Red Tidal',
    director: 'Jonah Hale',
    runtime: 97,
    score: 76,
    status: 'waitlist',
  },
  {
    id: 27,
    title: 'Paper Harbor',
    director: 'Inès Kaur',
    runtime: 110,
    score: 71,
    status: 'waitlist',
  },
  {
    id: 33,
    title: 'Low Voltage',
    director: 'Pavel Orth',
    runtime: 83,
    score: 64,
    status: 'passed',
  },
  {
    id: 36,
    title: 'Willow Relay',
    director: 'Asha Quinn',
    runtime: 99,
    score: 90,
    status: 'selected',
  },
  {
    id: 41,
    title: 'Copper Hour',
    director: 'Rui Mendes',
    runtime: 116,
    score: 69,
    status: 'passed',
  },
  {
    id: 44,
    title: 'Second Tide',
    director: 'Nora Berg',
    runtime: 102,
    score: 85,
    status: 'selected',
  },
  { id: 48, title: 'Kiln Notes', director: 'Theo Park', runtime: 78, score: 58, status: 'passed' },
  {
    id: 52,
    title: 'Amber Room',
    director: 'Sofia Nair',
    runtime: 134,
    score: 87,
    status: 'waitlist',
  },
  {
    id: 57,
    title: 'Eastbound',
    director: 'Calum Reed',
    runtime: 91,
    score: 73,
    status: 'waitlist',
  },
];

const STATUS_LABEL: Record<Status, string> = {
  selected: '入围',
  waitlist: '候补',
  passed: '未入围',
};

const ink = {
  text: '#152033',
  muted: '#5A687C',
  line: '#D0D8E4',
  fog: '#F3F6FB',
  header: '#E7EEF6',
  teal: '#1A7A72',
  tealSoft: '#E3F2F0',
  amber: '#B86E12',
  amberSoft: '#F8EEDC',
  clay: '#9A4F45',
  claySoft: '#F4E8E6',
  hover: '#EAF1F8',
};

const dockTheme = createTheme({
  palette: {
    primary: { main: ink.teal },
    text: { primary: ink.text, secondary: ink.muted },
    divider: ink.line,
    background: { paper: '#fff', default: ink.fog },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: 'none' },
  },
});

function Frame({
  kicker,
  title,
  hint,
  children,
}: {
  kicker?: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={1.5} sx={{ width: 'min(920px, 100%)', textAlign: 'left' }}>
      <Box>
        {kicker ? (
          <Typography
            variant="overline"
            sx={{ letterSpacing: '0.16em', color: ink.teal, fontWeight: 700, lineHeight: 1 }}
          >
            {kicker}
          </Typography>
        ) : null}
        <Typography variant="subtitle1" sx={{ fontWeight: 650, color: ink.text, mt: 0.25 }}>
          {title}
        </Typography>
        {hint ? (
          <Typography variant="body2" sx={{ color: ink.muted, mt: 0.5 }}>
            {hint}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Stack>
  );
}

/** 外层只定视口高度；滚动在 `.uikit-dt` 上。 */
const STORY_HEIGHT = 260;

const stickyHeaderSlots = {
  header: {
    style: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 2,
      background: 'var(--uikit-dt-header-bg)',
    },
  },
};

function Viewport({
  children,
  width,
  height = STORY_HEIGHT,
}: {
  children: ReactNode;
  width?: number | string;
  height?: number;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height,
        width: width ?? '100%',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 1.5,
        bgcolor: '#fff',
      }}
    >
      {children}
    </Box>
  );
}

function StatusChip({ value }: { value: Status }) {
  const map = {
    selected: { bgcolor: ink.tealSoft, color: ink.teal },
    waitlist: { bgcolor: ink.amberSoft, color: ink.amber },
    passed: { bgcolor: ink.claySoft, color: ink.clay },
  } as const;
  return (
    <Chip
      size="small"
      label={STATUS_LABEL[value]}
      sx={{
        height: 22,
        fontWeight: 650,
        fontSize: 11,
        letterSpacing: '0.04em',
        border: 0,
        ...map[value],
      }}
    />
  );
}

function ScoreMeter({ value }: { value: number }) {
  return (
    <Stack direction="row" spacing={1} sx={{ minWidth: 0, width: '100%', alignItems: 'center' }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1,
          height: 6,
          borderRadius: 99,
          bgcolor: ink.fog,
          '& .MuiLinearProgress-bar': {
            borderRadius: 99,
            bgcolor: value >= 85 ? ink.teal : value >= 70 ? ink.amber : ink.clay,
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{ width: 22, color: ink.muted, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

const basicColumns: DataTableColumn<Film>[] = [
  { key: 'id', accessor: 'id', header: '编号', width: 64, fixed: 'left' },
  { key: 'title', accessor: 'title', header: '片名', flex: 1, minWidth: 160 },
  { key: 'director', accessor: 'director', header: '导演', width: 128 },
  { key: 'runtime', accessor: 'runtime', header: '片长', width: 72 },
  {
    key: 'score',
    accessor: 'score',
    header: '评分',
    width: 140,
    renderCell: ({ value }) => <ScoreMeter value={Number(value)} />,
  },
  {
    key: 'status',
    accessor: 'status',
    header: '状态',
    width: 100,
    renderCell: ({ value }) => <StatusChip value={value as Status} />,
  },
];

function sortLabel(sort: SortState) {
  if (sort.length === 0) return '未排序 · 单击表头循环 none → asc → desc';
  return sort.map((item, index) => `${index + 1}. ${item.columnKey} ${item.direction}`).join(' → ');
}

export const NativeTable: Story = {
  name: 'Table',
  render: () => <NativeTableDemo />,
};

function NativeTableDemo() {
  const columns: TableColumn<Film>[] = [
    { key: 'id', accessor: 'id', header: '编号', width: 64, fixed: 'left' },
    { key: 'title', accessor: 'title', header: '片名' },
    { key: 'director', accessor: 'director', header: '导演' },
    { key: 'runtime', accessor: 'runtime', header: '片长' },
    { key: 'score', accessor: 'score', header: '评分' },
    { key: 'status', accessor: 'status', header: '状态' },
  ];
  return (
    <Frame
      kicker="Table"
      title="div 网格、纯文本单元格"
      hint="与 DataTable 同一套 compounds；单元格一律字符串化，没有 renderCell。getRowSpacing 打在行 margin 上。"
    >
      <Viewport>
        <Table
          data={FILMS}
          columns={columns}
          // getRowSpacing={() => ({ top: 6, bottom: 6 })}
          slotProps={stickyHeaderSlots}
        />
      </Viewport>
    </Frame>
  );
}

export const Borderless: Story = {
  name: 'Table · bordered={false}',
  render: () => <BorderlessDemo />,
};

function BorderlessDemo() {
  const columns: TableColumn<Film>[] = [
    { key: 'id', accessor: 'id', header: '编号', width: 64 },
    { key: 'title', accessor: 'title', header: '片名' },
    { key: 'director', accessor: 'director', header: '导演' },
    { key: 'runtime', accessor: 'runtime', header: '片长' },
    { key: 'score', accessor: 'score', header: '评分' },
    { key: 'status', accessor: 'status', header: '状态' },
  ];
  return (
    <Frame
      kicker="Table"
      title="关闭单元格边框"
      hint="Table / DataTable 共用 bordered，默认 true。false 时相邻格不再画线。"
    >
      <Viewport>
        <Table data={FILMS} columns={columns} bordered={false} slotProps={stickyHeaderSlots} />
      </Viewport>
    </Frame>
  );
}

export const Loading: Story = {
  name: 'Loading',
  render: () => <LoadingDemo />,
};

function LoadingDemo() {
  const columns: TableColumn<Film>[] = [
    { key: 'id', accessor: 'id', header: '编号', width: 64, fixed: 'left' },
    { key: 'title', accessor: 'title', header: '片名' },
    { key: 'director', accessor: 'director', header: '导演' },
    { key: 'runtime', accessor: 'runtime', header: '片长' },
    { key: 'score', accessor: 'score', header: '评分' },
    { key: 'status', accessor: 'status', header: '状态' },
  ];
  const [mode, setMode] = useState<TableLoading>('row');
  const [hasData, setHasData] = useState(false);
  const modes: TableLoading[] = hasData ? ['row', 'cell', 'line', 'spin'] : ['row', 'cell', 'spin'];
  return (
    <Frame
      kicker="Loading"
      title="row / cell 骨架，line 表头线，spin Body 中央"
      hint="无数据可用 row、cell、spin；有数据四种都能选。line 在无数据时会回退成 row。四种 UI 可用 slots.loadingRow / loadingCell / loadingLine / loadingSpin 替换。"
    >
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {modes.map((item) => (
          <Chip
            key={item}
            size="small"
            label={item}
            onClick={() => setMode(item)}
            sx={{
              fontWeight: 650,
              bgcolor: mode === item ? ink.tealSoft : ink.fog,
              color: mode === item ? ink.teal : ink.muted,
            }}
          />
        ))}
        <Chip
          size="small"
          label={hasData ? '有 data' : '无 data'}
          onClick={() => {
            setHasData((value) => {
              const next = !value;
              if (!next && mode === 'line') setMode('row');
              return next;
            });
          }}
          sx={{ fontWeight: 650, bgcolor: ink.amberSoft, color: ink.amber }}
        />
      </Stack>
      <Viewport>
        <Table
          data={hasData ? FILMS : []}
          columns={columns}
          loading={mode}
          slotProps={stickyHeaderSlots}
        />
      </Viewport>
    </Frame>
  );
}

export const Basic: Story = {
  name: 'DataTable · flex / renderCell',
  render: () => <BasicDemo />,
};

function BasicDemo() {
  return (
    <Frame
      kicker="DataTable"
      title="div 网格、flex 列、列级 renderCell"
      hint="片名列 flex:1；评分与状态用 MUI 画在列渲染器里，不必换 slot。"
    >
      <Viewport>
        <DataTable
          data={FILMS}
          columns={basicColumns}
          defaultSort={{ columnKey: 'score', direction: 'desc' }}
          getRowSpacing={() => ({ top: 8, bottom: 8 })}
          slotProps={stickyHeaderSlots}
        />
      </Viewport>
    </Frame>
  );
}

export const MultiSort: Story = {
  name: 'DataTable · multiSort',
  render: () => <MultiSortDemo />,
};

function MultiSortDemo() {
  const columns: DataTableColumn<Film>[] = [
    { key: 'title', accessor: 'title', header: '片名', flex: 1, minWidth: 160 },
    { key: 'status', accessor: 'status', header: '状态', width: 100 },
    { key: 'score', accessor: 'score', header: '评分', width: 80 },
    { key: 'runtime', accessor: 'runtime', header: '片长', width: 72, sortable: false },
  ];
  const [sort, setSort] = useState<SortState>([
    { columnKey: 'status', direction: 'asc' },
    { columnKey: 'score', direction: 'desc' },
  ]);
  return (
    <Frame
      kicker="Sorting"
      title="多列排序"
      hint="multiSort 时单击追加；同一列再点 asc → desc → 移除。片长列 sortable:false。"
    >
      <Typography variant="caption" sx={{ color: ink.muted, fontVariantNumeric: 'tabular-nums' }}>
        {sortLabel(sort)}
      </Typography>
      <Viewport>
        <DataTable
          data={FILMS}
          columns={columns}
          sort={sort}
          onSortChange={setSort}
          multiSort
          getRowSpacing={() => ({ top: 8, bottom: 8 })}
          slotProps={stickyHeaderSlots}
        />
      </Viewport>
    </Frame>
  );
}

export const FrozenColumns: Story = {
  name: 'DataTable · frozen + spacing',
  render: () => <FrozenDemo />,
};

function FrozenDemo() {
  const columns: DataTableColumn<Film>[] = [
    { key: 'id', accessor: 'id', header: '编号', width: 64, fixed: 'left' },
    { key: 'title', accessor: 'title', header: '片名', width: 180 },
    { key: 'director', accessor: 'director', header: '导演', width: 140 },
    { key: 'runtime', accessor: 'runtime', header: '片长', width: 88 },
    { key: 'score', accessor: 'score', header: '评分', width: 88 },
    {
      key: 'status',
      accessor: 'status',
      header: '状态',
      width: 100,
      fixed: 'right',
      renderCell: ({ value }) => <StatusChip value={value as Status} />,
    },
  ];
  return (
    <Frame
      kicker="Layout"
      title="左右冻结 + 按行间距"
      hint="视口 480×260。编号 sticky left，状态 sticky right；纵向、横向都会出滚动条。"
    >
      <Viewport width={480}>
        <DataTable
          data={FILMS}
          columns={columns}
          getRowSpacing={({ row }) =>
            row.status === 'selected' ? { top: 14, bottom: 14 } : { top: 6, bottom: 6 }
          }
          slotProps={stickyHeaderSlots}
        />
      </Viewport>
    </Frame>
  );
}

export const WithPagination: Story = {
  name: 'DataTable · pagination',
  render: () => <PaginationDemo />,
};

function PaginationDemo() {
  const catalog = useMemo<Film[]>(
    () =>
      Array.from({ length: 47 }, (_, i) => ({
        ...FILMS[i % FILMS.length]!,
        id: i + 1,
        title: `${FILMS[i % FILMS.length]!.title} ${Math.floor(i / FILMS.length) + 1}`,
      })),
    [],
  );
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { pageCount, start, end } = usePagination({
    total: catalog.length,
    pageSize,
    page,
    onPageChange: setPage,
  });
  return (
    <Frame
      kicker="Pagination"
      title="外部分页再喂给表格"
      hint="usePagination 切片；Pagination 不内嵌进 DataTable。"
    >
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Viewport height={STORY_HEIGHT} width="100%">
          <DataTable
            data={catalog.slice(start, end)}
            columns={basicColumns}
            getRowSpacing={() => ({ top: 8, bottom: 8 })}
            slotProps={stickyHeaderSlots}
          />
        </Viewport>
        <Stack
          direction="row"
          sx={{
            mt: 0,
            px: 1.5,
            py: 1,
            borderTop: `1px solid ${ink.line}`,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: ink.muted }}>
            {start + 1}–{end} / {catalog.length}
          </Typography>
          <Box
            sx={{
              '& .uikit-dt-pagination': {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              },
              '& .uikit-dt-pagination button': {
                minWidth: 32,
                height: 32,
                px: 1,
                border: `1px solid ${ink.line}`,
                borderRadius: 1.5,
                bgcolor: '#fff',
                color: ink.text,
                font: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
              },
              '& .uikit-dt-pagination button[aria-current="page"]': {
                bgcolor: ink.teal,
                borderColor: ink.teal,
                color: '#fff',
                fontWeight: 700,
              },
              '& .uikit-dt-pagination button:disabled': {
                opacity: 0.35,
                cursor: 'default',
              },
              '& .uikit-dt-pagination span': { px: 0.5, color: ink.muted },
            }}
          >
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Stack>
      </Paper>
    </Frame>
  );
}

export const Compounds: Story = {
  name: 'DataTable · compounds',
  render: () => <CompoundsDemo />,
};

function CompoundsDemo() {
  const columns: DataTableColumn<Film>[] = [
    { key: 'title', accessor: 'title', header: '片名', flex: 1, minWidth: 160 },
    { key: 'director', accessor: 'director', header: '导演', width: 128 },
    { key: 'score', accessor: 'score', header: '评分', width: 140 },
    { key: 'status', accessor: 'status', header: '状态', width: 100 },
  ];
  return (
    <Frame
      kicker="Compounds"
      title="Root / Header / HeaderRow / HeaderCell / Body"
      hint="默认 <DataTable /> 等于这套 chrome。HeaderCell 用 columnKey；Body 默认按 columns 渲染行。"
    >
      <Viewport>
        <DataTable.Root
          data={FILMS}
          columns={columns}
          defaultSort={{ columnKey: 'title', direction: 'asc' }}
          getRowSpacing={() => ({ top: 8, bottom: 8 })}
          slotProps={stickyHeaderSlots}
        >
          <DataTable.Header>
            <DataTable.HeaderRow>
              <DataTable.HeaderCell columnKey="title" />
              <DataTable.HeaderCell columnKey="director" />
              <DataTable.HeaderCell columnKey="score" />
              <DataTable.HeaderCell columnKey="status" />
            </DataTable.HeaderRow>
          </DataTable.Header>
          <DataTable.Body />
        </DataTable.Root>
      </Viewport>
    </Frame>
  );
}

function MuiRoot({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Paper
      className={className}
      style={style}
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
        overscrollBehavior: 'none',
        border: `1px solid ${ink.line}`,
        borderRadius: 2,
        bgcolor: '#fff',
      }}
    >
      {children}
    </Paper>
  );
}

function MuiHeader({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Box
      className={className}
      style={style}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 3,
        bgcolor: ink.header,
        borderBottom: `1px solid ${ink.line}`,
      }}
    >
      {children}
    </Box>
  );
}

function MuiHeaderRow({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Box
      className={className}
      style={style}
      sx={{ display: 'flex', width: 'max-content', minWidth: '100%', minHeight: 44 }}
    >
      {children}
    </Box>
  );
}

function MuiHeaderCell({
  sorted,
  sortable,
  label: _label,
  column: _column,
  fixed,
  children,
  style,
  className,
  ...rest
}: TableHeaderCellSlotProps) {
  return (
    <Box
      {...rest}
      className={className}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        px: 1.5,
        bgcolor: ink.header,
        boxShadow: sorted ? `inset 3px 0 0 ${ink.teal}` : undefined,
        '& > button': {
          all: 'unset',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          width: '100%',
          cursor: sortable ? 'pointer' : 'default',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: sorted ? ink.teal : ink.muted,
        },
      }}
    >
      {children}
      {fixed ? (
        <Typography
          component="span"
          sx={{ ml: 0.5, fontSize: 9, color: ink.muted, alignSelf: 'center' }}
        >
          pin
        </Typography>
      ) : null}
    </Box>
  );
}

function MuiBody({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Box className={className} style={style}>
      {children}
    </Box>
  );
}

function MuiRow({
  row: _row,
  index,
  children,
  style,
  className,
  ...rest
}: TableRowSlotProps<Film>) {
  return (
    <Box
      {...rest}
      className={className}
      style={style}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        bgcolor: index % 2 === 1 ? ink.fog : '#fff',
        borderBottom: `1px solid ${ink.line}`,
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: ink.hover },
      }}
    >
      {children}
    </Box>
  );
}

function MuiCell({
  value,
  row: _row,
  index: _index,
  column,
  children,
  style,
  className,
  ...rest
}: TableCellSlotProps<Film>) {
  const content =
    column.key === 'status' ? (
      <StatusChip value={value as Status} />
    ) : column.key === 'score' ? (
      <ScoreMeter value={Number(value)} />
    ) : column.key === 'title' ? (
      <Typography variant="body2" sx={{ fontWeight: 650, color: ink.text }}>
        {String(value ?? '')}
      </Typography>
    ) : column.key === 'runtime' ? (
      <Typography variant="body2" sx={{ color: ink.muted, fontVariantNumeric: 'tabular-nums' }}>
        {`${String(value ?? '')}′`}
      </Typography>
    ) : (
      (children ?? String(value ?? ''))
    );

  return (
    <Box
      {...rest}
      className={className}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 1.25,
        fontSize: 13,
        color: ink.text,
        bgcolor: 'inherit',
      }}
    >
      {content}
    </Box>
  );
}

export const MuiSlots: Story = {
  name: 'DataTable · MUI slots',
  render: () => <MuiSlotsDemo />,
};

function MuiSlotsDemo() {
  const columns: DataTableColumn<Film>[] = [
    { key: 'id', accessor: 'id', header: 'No.', width: 72, fixed: 'left' },
    { key: 'title', accessor: 'title', header: 'Title', flex: 1, minWidth: 168 },
    { key: 'director', accessor: 'director', header: 'Director', width: 128 },
    { key: 'runtime', accessor: 'runtime', header: 'Runtime', width: 88 },
    { key: 'score', accessor: 'score', header: 'Score', width: 148 },
    { key: 'status', accessor: 'status', header: 'Status', width: 108, fixed: 'right' },
  ];
  const [sort, setSort] = useState<SortState>([{ columnKey: 'score', direction: 'desc' }]);

  return (
    <ThemeProvider theme={dockTheme}>
      <Frame
        kicker="Slots"
        title="七个 slot 全部换成 MUI"
        hint="自定义 slot 不会带 uikit-dt* class。本例关掉默认 class，表头排序轨、斑马行、Chip / Progress 都画在 slot 上。请解构 sorted / row / value，不要 spread 到 DOM。"
      >
        <Typography variant="caption" sx={{ color: ink.muted }}>
          {sortLabel(sort)}
        </Typography>
        <Viewport>
          <DataTable
            data={FILMS}
            columns={columns}
            sort={sort}
            onSortChange={setSort}
            disableDefaultStyles
            getRowSpacing={() => ({ top: 0, bottom: 0 })}
            renderSortIndicator={(direction) =>
              direction === 'asc' ? ' ▴' : direction === 'desc' ? ' ▾' : ''
            }
            slots={{
              root: MuiRoot,
              header: MuiHeader,
              headerRow: MuiHeaderRow,
              headerCell: MuiHeaderCell,
              body: MuiBody,
              row: MuiRow,
              cell: MuiCell,
            }}
          />
        </Viewport>
      </Frame>
    </ThemeProvider>
  );
}
