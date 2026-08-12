import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../src/components/DataTable';
import type { DataTableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  score: number;
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', accessor: 'name', header: 'Name', width: 120 },
  { key: 'score', accessor: 'score', header: 'Score', width: 80, flex: 1 },
];

const data: Row[] = [
  { id: 0, name: 'bob', score: 30 },
  { id: 1, name: 'alice', score: 20 },
];

describe('DataTable', () => {
  it('渲染 role=table 语义与纯文本回退', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'bob' })).toHaveLength(1);
    // score 列回退为纯文本
    expect(screen.getByRole('cell', { name: '30' })).toBeInTheDocument();
  });

  it('renderCell / renderHeaderCell 自定义渲染', () => {
    const cols: DataTableColumn<Row>[] = [
      {
        key: 'name',
        accessor: 'name',
        header: 'Name',
        renderHeaderCell: ({ column }) => `Header:${String(column.header)}`,
        renderCell: ({ value }) => <strong>★{String(value)}</strong>,
      },
    ];
    render(<DataTable data={data} columns={cols} />);
    expect(screen.getByRole('columnheader', { name: /Header:Name/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '★bob' })).toBeInTheDocument();
  });

  it('点击表头排序并更新 aria-sort 与行序', async () => {
    const user = userEvent.setup();
    render(<DataTable data={data} columns={columns} />);
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    await user.click(within(nameHeader).getByRole('button'));
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    const rows = screen.getAllByRole('row');
    // rows[0]=header, rows[1]=alice, rows[2]=bob
    expect(within(rows[1]).getByRole('cell', { name: 'alice' })).toBeInTheDocument();
  });

  it('受控 sort 由 props 驱动', () => {
    const { rerender } = render(
      <DataTable data={data} columns={columns} sort={{ columnKey: 'score', direction: 'desc' }} />,
    );
    expect(
      within(screen.getAllByRole('row')[1]).getByRole('cell', { name: 'bob' }),
    ).toBeInTheDocument();
    rerender(
      <DataTable data={data} columns={columns} sort={{ columnKey: 'score', direction: 'asc' }} />,
    );
    expect(
      within(screen.getAllByRole('row')[1]).getByRole('cell', { name: 'alice' }),
    ).toBeInTheDocument();
  });

  it('onSortChange 回调', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<DataTable data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(
      within(screen.getByRole('columnheader', { name: /name/i })).getByRole('button'),
    );
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'name', direction: 'asc' });
  });

  it('flex 列应用 flex-grow(width 为基础宽度),定宽列定宽', () => {
    render(<DataTable data={data} columns={columns} />);
    const scoreHeader = screen.getByRole('columnheader', { name: /score/i });
    // flex 列: grow=1, shrink=1, 基础宽度=width 80px
    expect(scoreHeader).toHaveStyle({ flexGrow: '1', flexShrink: '1', flexBasis: '80px' });
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    expect(nameHeader).toHaveStyle({ flex: '0 0 auto', width: '120px' });
  });

  it('getRowSpacing 作用于行 padding', () => {
    render(
      <DataTable data={data} columns={columns} getRowSpacing={() => ({ top: 8, bottom: 4 })} />,
    );
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toHaveStyle({ paddingTop: '8px', paddingBottom: '4px' });
  });

  it('固定列应用 sticky 样式', () => {
    const cols: DataTableColumn<Row>[] = [
      { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
      { key: 'name', accessor: 'name', header: 'Name', width: 120 },
    ];
    render(<DataTable data={data} columns={cols} />);
    expect(screen.getByRole('columnheader', { name: /id/i })).toHaveStyle({
      position: 'sticky',
      left: '0px',
    });
  });

  it('slots 替换内部元素并透传 slotProps', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        slots={{ row: 'section' }}
        slotProps={{ row: { 'data-custom': 'row' } }}
      />,
    );
    const rows = screen.getAllByRole('row');
    // rows[0] 是 headerRow(rowgroup 内),rows[1..] 是数据行
    const dataRow = rows[1];
    expect(dataRow.tagName).toBe('SECTION');
    expect(dataRow).toHaveAttribute('data-custom', 'row');
  });
});
