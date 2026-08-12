import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VirtualTable } from '../src/components/VirtualTable';
import type { VirtualTableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  score: number;
}

const columns: VirtualTableColumn<Row>[] = [
  { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
  { key: 'name', accessor: 'name', header: 'Name', width: 120 },
  { key: 'score', accessor: 'score', header: 'Score', width: 80 },
];

const data: Row[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `name-${i}`,
  score: 100 - i,
}));

/** 设置容器 clientHeight 并派发 scroll 触发重测 */
function withViewport(container: HTMLElement, height: number) {
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: height });
  fireEvent.scroll(container);
}

describe('VirtualTable', () => {
  it('只渲染可见区间 + overscan,而非全部行', () => {
    render(<VirtualTable data={data} columns={columns} rowHeight={30} height={300} overscan={5} />);
    const container = screen.getByRole('table');
    const body = container.querySelector('div[role="rowgroup"]:nth-of-type(2)') as HTMLElement;
    withViewport(body, 300);
    // 100 行数据,可见约 0-16 行
    expect(within(container).getAllByRole('row').length).toBeLessThan(100);
    expect(within(body).getAllByRole('row').length).toBeGreaterThan(0);
    expect(within(body).getAllByRole('row').length).toBeLessThanOrEqual(16);
  });

  it('滚动后渲染新的可见区间', () => {
    render(<VirtualTable data={data} columns={columns} rowHeight={30} height={300} overscan={5} />);
    const container = screen.getByRole('table');
    const body = container.querySelector('div[role="rowgroup"]:nth-of-type(2)') as HTMLElement;
    withViewport(body, 300);
    body.scrollTop = 600;
    fireEvent.scroll(body);
    const rows = within(body).getAllByRole('row');
    // 区间 15-36,首行应为 name-15
    expect(rows[0]).toHaveTextContent('name-15');
  });

  it('排序后虚拟区间基于排序结果', async () => {
    const user = userEvent.setup();
    render(<VirtualTable data={data} columns={columns} rowHeight={30} height={300} overscan={5} />);
    const container = screen.getByRole('table');
    const body = container.querySelector('div[role="rowgroup"]:nth-of-type(2)') as HTMLElement;
    withViewport(body, 300);
    // score 两次点击 → desc: name-0(score=100)最大排第一
    const scoreButton = within(screen.getByRole('columnheader', { name: /score/i })).getByRole(
      'button',
    );
    await user.click(scoreButton);
    await user.click(scoreButton);
    expect(screen.getByRole('columnheader', { name: /score/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    const rows = within(body).getAllByRole('row');
    expect(rows[0]).toHaveTextContent('name-0');
  });

  it('onSortChange 回调', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <VirtualTable data={data} columns={columns} rowHeight={30} onSortChange={onSortChange} />,
    );
    await user.click(within(screen.getByRole('columnheader', { name: /id/i })).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'id', direction: 'asc' });
  });

  it('getRowSpacing 计入行高并作用于行 padding(常量)', () => {
    render(
      <VirtualTable
        data={data}
        columns={columns}
        rowHeight={30}
        height={300}
        overscan={5}
        getRowSpacing={() => ({ top: 8, bottom: 8 })}
      />,
    );
    const container = screen.getByRole('table');
    const body = container.querySelector('div[role="rowgroup"]:nth-of-type(2)') as HTMLElement;
    withViewport(body, 300);
    const firstRow = within(body).getAllByRole('row')[0];
    expect(firstRow).toHaveStyle({ paddingTop: '8px', paddingBottom: '8px' });
    // effective = 46, 可见约 0-13 行
    expect(within(body).getAllByRole('row').length).toBeLessThanOrEqual(13);
  });

  it('固定列 sticky 且表头 sticky top', () => {
    render(<VirtualTable data={data} columns={columns} rowHeight={30} height={300} />);
    const idHeader = screen.getByRole('columnheader', { name: /id/i });
    expect(idHeader).toHaveStyle({ position: 'sticky', left: '0px' });
    const container = screen.getByRole('table');
    const body = container.querySelector('div[role="rowgroup"]:nth-of-type(2)') as HTMLElement;
    withViewport(body, 300);
    const firstBodyCell = within(within(body).getAllByRole('row')[0]).getAllByRole('cell')[0];
    expect(firstBodyCell).toHaveStyle({ position: 'sticky', left: '0px' });
  });

  it('renderCell 自定义渲染', () => {
    const cols: VirtualTableColumn<Row>[] = [
      {
        key: 'name',
        accessor: 'name',
        header: 'Name',
        width: 120,
        renderCell: ({ value }) => `★${String(value)}`,
      },
    ];
    render(<VirtualTable data={data.slice(0, 3)} columns={cols} rowHeight={30} height={300} />);
    expect(screen.getByRole('cell', { name: '★name-0' })).toBeInTheDocument();
  });
});
