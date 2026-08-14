import { render, screen } from '@testing-library/react';
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

function bodyRows() {
  return document.querySelectorAll('.uikit-dt__body .uikit-dt__row');
}

describe('Table', () => {
  it('渲染表头与纯文本单元格', () => {
    render(<Table data={data} columns={columns} />);
    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    const rows = bodyRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('bob');
    expect(rows[0]).toHaveTextContent('30');
    expect(rows[1]).toHaveTextContent('alice');
  });

  it('点击表头切换排序并更新行序', async () => {
    const user = userEvent.setup();
    render(<Table data={data} columns={columns} />);
    const sortButton = screen.getByRole('button', { name: /name/i });
    await user.click(sortButton);
    expect(bodyRows()[0]).toHaveTextContent('alice');
    await user.click(sortButton);
    expect(bodyRows()[0]).toHaveTextContent('bob');
  });

  it('第三次点击回到无排序原序', async () => {
    const user = userEvent.setup();
    render(<Table data={data} columns={columns} />);
    const sortButton = screen.getByRole('button', { name: /name/i });
    await user.click(sortButton);
    await user.click(sortButton);
    await user.click(sortButton);
    expect(bodyRows()[0]).toHaveTextContent('bob');
    expect(bodyRows()[1]).toHaveTextContent('alice');
  });

  it('sortable: false 的列不渲染排序按钮', () => {
    const cols: TableColumn<Row>[] = [{ key: 'id', accessor: 'id', header: 'ID', sortable: false }];
    render(<Table data={data} columns={cols} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('.uikit-dt__header-cell')).toHaveTextContent('ID');
  });

  it('受控 sort 由 props 驱动', () => {
    const { rerender } = render(
      <Table data={data} columns={columns} sort={{ columnKey: 'score', direction: 'desc' }} />,
    );
    expect(bodyRows()[0]).toHaveTextContent('bob');
    rerender(
      <Table data={data} columns={columns} sort={{ columnKey: 'score', direction: 'asc' }} />,
    );
    expect(bodyRows()[0]).toHaveTextContent('alice');
  });

  it('onSortChange 回调触发', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: /name/i }));
    expect(onSortChange).toHaveBeenCalledWith([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('Shift+click 追加第二列排序', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: /name/i }));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('button', { name: /score/i }));
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
    await user.click(screen.getByRole('button', { name: /name/i }));
    await user.click(screen.getByRole('button', { name: /score/i }));
    expect(onSortChange).toHaveBeenLastCalledWith([
      { columnKey: 'name', direction: 'asc' },
      { columnKey: 'score', direction: 'asc' },
    ]);
  });

  it('div 表头行与数据行是 flex 行', () => {
    render(<Table data={data} columns={columns} />);
    expect(document.querySelector('.uikit-dt__header-row')).toHaveStyle({ display: 'flex' });
    expect(bodyRows()[0]).toHaveStyle({ display: 'flex' });
  });

  it('未指定 width 的列表头与单元格使用同一套均分宽度', () => {
    render(<Table data={data} columns={columns} />);
    const headerCells = document.querySelectorAll('.uikit-dt__header-cell');
    const bodyCells = bodyRows()[0]!.querySelectorAll('.uikit-dt__cell');
    const shared = { flexGrow: '1', flexShrink: '1', flexBasis: '0px', minWidth: '0px' };
    expect(headerCells[0]).toHaveStyle(shared);
    expect(headerCells[1]).toHaveStyle(shared);
    expect(bodyCells[0]).toHaveStyle(shared);
    expect(bodyCells[1]).toHaveStyle(shared);
  });

  it('指定 width 的列在表头与单元格上同宽，其余列均分', () => {
    const cols: TableColumn<Row>[] = [
      { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
      { key: 'name', accessor: 'name', header: 'Name' },
    ];
    render(<Table data={data} columns={cols} />);
    const headerCells = document.querySelectorAll('.uikit-dt__header-cell');
    const bodyCells = bodyRows()[0]!.querySelectorAll('.uikit-dt__cell');
    expect(headerCells[0]).toHaveStyle({ flex: '0 0 auto', width: '50px' });
    expect(bodyCells[0]).toHaveStyle({ flex: '0 0 auto', width: '50px' });
    expect(headerCells[1]).toHaveStyle({ flexGrow: '1', flexBasis: '0px' });
    expect(bodyCells[1]).toHaveStyle({ flexGrow: '1', flexBasis: '0px' });
  });

  it('getRowSpacing 作用于行 margin', () => {
    render(<Table data={data} columns={columns} getRowSpacing={() => ({ top: 8, bottom: 4 })} />);
    expect(bodyRows()[0]).toHaveStyle({ marginTop: '8px', marginBottom: '4px' });
  });

  it('getRowSpacing 时行带 spaced，单元格能画完整上下边框', () => {
    render(<Table data={data} columns={columns} getRowSpacing={() => ({ top: 8, bottom: 8 })} />);
    const rows = bodyRows();
    expect(rows[0]).toHaveClass('uikit-dt__row--spaced');
    expect(rows[1]).toHaveClass('uikit-dt__row--spaced');
  });

  it('无 getRowSpacing 时行不带 spaced', () => {
    render(<Table data={data} columns={columns} />);
    expect(bodyRows()[0]).not.toHaveClass('uikit-dt__row--spaced');
  });

  it('固定列应用 sticky 样式', () => {
    const cols: TableColumn<Row>[] = [
      { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
      { key: 'name', accessor: 'name', header: 'Name' },
    ];
    render(<Table data={data} columns={cols} />);
    const headerCell = document.querySelector('.uikit-dt__header-cell');
    expect(headerCell).toHaveClass('uikit-dt__header-cell--frozen');
    expect(headerCell).toHaveStyle({
      position: 'sticky',
      left: '0px',
      background: 'var(--uikit-dt-header-bg)',
    });
    const bodyCell = bodyRows()[0]!.querySelector('.uikit-dt__cell');
    expect(bodyCell).toHaveClass('uikit-dt__cell--frozen');
    expect(bodyCell).toHaveStyle({
      position: 'sticky',
      left: '0px',
      background: 'var(--uikit-dt-bg)',
    });
  });

  it('右侧冻结列带 frozen-right', () => {
    const cols: TableColumn<Row>[] = [
      { key: 'name', accessor: 'name', header: 'Name' },
      { key: 'score', accessor: 'score', header: 'Score', width: 80, fixed: 'right' },
    ];
    render(<Table data={data} columns={cols} />);
    const headerCells = document.querySelectorAll('.uikit-dt__header-cell');
    expect(headerCells[1]).toHaveClass('uikit-dt__header-cell--frozen-right');
    const bodyCells = bodyRows()[0]!.querySelectorAll('.uikit-dt__cell');
    expect(bodyCells[1]).toHaveClass('uikit-dt__cell--frozen-right');
  });

  it('getRowKey 用于行 key', () => {
    render(<Table data={data} columns={columns} getRowKey={(row) => `row-${row.id}`} />);
    expect(bodyRows()).toHaveLength(2);
  });

  it('默认显示边框', () => {
    render(<Table data={data} columns={columns} />);
    expect(document.querySelector('.uikit-dt')).not.toHaveClass('uikit-dt--borderless');
  });

  it('bordered={false} 关闭边框', () => {
    render(<Table data={data} columns={columns} bordered={false} />);
    expect(document.querySelector('.uikit-dt')).toHaveClass('uikit-dt--borderless');
  });
});
