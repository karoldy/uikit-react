import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Table } from '../src/components/Table';
import type { TableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  score: number;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', accessor: 'name', header: 'Name' },
  { key: 'score', accessor: 'score', header: 'Score' },
];

const data: Row[] = [
  { id: 0, name: 'bob', score: 30 },
  { id: 1, name: 'alice', score: 20 },
];

describe('Table', () => {
  it('渲染表头与纯文本单元格', () => {
    render(<Table data={data} columns={columns} />);
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header + 2 data
    // 原序: rows[1]=bob(30), rows[2]=alice(20)
    expect(within(rows[1]).getByRole('cell', { name: 'bob' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('cell', { name: '30' })).toBeInTheDocument();
    expect(within(rows[2]).getByRole('cell', { name: 'alice' })).toBeInTheDocument();
  });

  it('点击表头切换排序并更新行序', async () => {
    const user = userEvent.setup();
    render(<Table data={data} columns={columns} />);
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    const sortButton = within(nameHeader).getByRole('button');
    await user.click(sortButton);
    // 排序后重新查询行
    let rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('cell', { name: 'alice' })).toBeInTheDocument();
    await user.click(sortButton);
    rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('cell', { name: 'bob' })).toBeInTheDocument();
  });

  it('第三次点击回到无排序原序', async () => {
    const user = userEvent.setup();
    render(<Table data={data} columns={columns} />);
    const sortButton = within(screen.getByRole('columnheader', { name: /name/i })).getByRole(
      'button',
    );
    await user.click(sortButton);
    await user.click(sortButton);
    await user.click(sortButton);
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('cell', { name: 'bob' })).toBeInTheDocument();
    expect(within(rows[2]).getByRole('cell', { name: 'alice' })).toBeInTheDocument();
  });

  it('sortable: false 的列不渲染排序按钮', () => {
    const cols: TableColumn<Row>[] = [{ key: 'id', accessor: 'id', header: 'ID', sortable: false }];
    render(<Table data={data} columns={cols} />);
    expect(within(screen.getByRole('columnheader')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('受控 sort 由 props 驱动', () => {
    const { rerender } = render(
      <Table data={data} columns={columns} sort={{ columnKey: 'score', direction: 'desc' }} />,
    );
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByRole('cell', { name: 'bob' })).toBeInTheDocument();
    rerender(
      <Table data={data} columns={columns} sort={{ columnKey: 'score', direction: 'asc' }} />,
    );
    expect(
      within(screen.getAllByRole('row')[1]).getByRole('cell', { name: 'alice' }),
    ).toBeInTheDocument();
  });

  it('onSortChange 回调触发', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(
      within(screen.getByRole('columnheader', { name: /name/i })).getByRole('button'),
    );
    expect(onSortChange).toHaveBeenCalledWith([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('Shift+click 追加第二列排序', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(
      within(screen.getByRole('columnheader', { name: /name/i })).getByRole('button'),
    );
    await user.keyboard('{Shift>}');
    await user.click(
      within(screen.getByRole('columnheader', { name: /score/i })).getByRole('button'),
    );
    await user.keyboard('{/Shift}');
    expect(onSortChange).toHaveBeenLastCalledWith([
      { columnKey: 'name', direction: 'asc' },
      { columnKey: 'score', direction: 'asc' },
    ]);
  });

  it('multiSort 时单击追加列', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table data={data} columns={columns} multiSort onSortChange={onSortChange} />);
    await user.click(
      within(screen.getByRole('columnheader', { name: /name/i })).getByRole('button'),
    );
    await user.click(
      within(screen.getByRole('columnheader', { name: /score/i })).getByRole('button'),
    );
    expect(onSortChange).toHaveBeenLastCalledWith([
      { columnKey: 'name', direction: 'asc' },
      { columnKey: 'score', direction: 'asc' },
    ]);
  });

  it('原生 tr 不设 display flex', () => {
    render(<Table data={data} columns={columns} />);
    const headerRow = document.querySelector('thead tr');
    const bodyRow = document.querySelector('tbody tr');
    expect(headerRow).not.toHaveStyle({ display: 'flex' });
    expect(bodyRow).not.toHaveStyle({ display: 'flex' });
  });

  it('getRowSpacing 作用于各 td 的 padding', () => {
    render(<Table data={data} columns={columns} getRowSpacing={() => ({ top: 8, bottom: 4 })} />);
    const firstCell = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0];
    expect(firstCell).toHaveStyle({ paddingTop: '8px', paddingBottom: '4px' });
  });

  it('固定列应用 sticky 样式', () => {
    const cols: TableColumn<Row>[] = [
      { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
      { key: 'name', accessor: 'name', header: 'Name' },
    ];
    render(<Table data={data} columns={cols} />);
    const headerCell = screen.getByRole('columnheader', { name: /id/i });
    expect(headerCell).toHaveStyle({ position: 'sticky', left: '0px' });
    const bodyCell = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0];
    expect(bodyCell).toHaveStyle({ position: 'sticky', left: '0px' });
  });

  it('getRowKey 用于行 key', () => {
    const { container } = render(
      <Table data={data} columns={columns} getRowKey={(row) => `row-${row.id}`} />,
    );
    const trs = container.querySelectorAll('tbody tr');
    expect(trs[0].getAttribute('data-key')).toBeNull(); // 仅验证不抛错、渲染正常
    expect(trs).toHaveLength(2);
  });
});
