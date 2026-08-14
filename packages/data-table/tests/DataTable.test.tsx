import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../src/components/DataTable';
import type { DataTableColumn } from '../src/types';
import { testSlots } from './test-slots';

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
  it('渲染表头与纯文本回退', () => {
    render(<DataTable data={data} columns={columns} slots={testSlots} />);
    const root = document.querySelector('.uikit-dt');
    expect(root).not.toBeNull();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
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
    render(<DataTable data={data} columns={cols} slots={testSlots} />);
    expect(screen.getByLabelText(/Header:Name/)).toBeInTheDocument();
    expect(screen.getByText('★bob')).toBeInTheDocument();
  });

  it('点击表头排序并更新行序', async () => {
    const user = userEvent.setup();
    render(<DataTable data={data} columns={columns} slots={testSlots} />);
    const nameHeader = screen.getByLabelText(/name/i);
    await user.click(within(nameHeader).getByRole('button'));
    const root = document.querySelector('.uikit-dt') as HTMLElement;
    const rows = root.querySelector('.uikit-dt__body')!.children;
    expect(within(rows[0] as HTMLElement).getByLabelText('alice')).toBeInTheDocument();
  });

  it('受控 sort 由 props 驱动', () => {
    const { rerender } = render(
      <DataTable
        data={data}
        columns={columns}
        slots={testSlots}
        sort={{ columnKey: 'score', direction: 'desc' }}
      />,
    );
    const root = document.querySelector('.uikit-dt') as HTMLElement;
    const rows = root.querySelector('.uikit-dt__body')!.children;
    expect(within(rows[0] as HTMLElement).getByLabelText('bob')).toBeInTheDocument();
    rerender(
      <DataTable
        data={data}
        columns={columns}
        slots={testSlots}
        sort={{ columnKey: 'score', direction: 'asc' }}
      />,
    );
    const nextRows = (document.querySelector('.uikit-dt') as HTMLElement).querySelector(
      '.uikit-dt__body',
    )!.children;
    expect(within(nextRows[0] as HTMLElement).getByLabelText('alice')).toBeInTheDocument();
  });

  it('onSortChange 回调', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable data={data} columns={columns} slots={testSlots} onSortChange={onSortChange} />,
    );
    await user.click(within(screen.getByLabelText(/name/i)).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('div 表头行与数据行是 flex 行,列宽才能生效', () => {
    render(<DataTable data={data} columns={columns} slots={testSlots} />);
    expect(document.querySelector('.uikit-dt__header-row')).toHaveStyle({ display: 'flex' });
    expect(document.querySelector('.uikit-dt__body')!.firstElementChild).toHaveStyle({
      display: 'flex',
    });
  });

  it('flex 列应用 flex-grow(width 为基础宽度),定宽列定宽', () => {
    render(<DataTable data={data} columns={columns} slots={testSlots} />);
    const scoreHeader = screen.getByLabelText(/score/i);
    expect(scoreHeader).toHaveStyle({ flexGrow: '1', flexShrink: '1', flexBasis: '80px' });
    const nameHeader = screen.getByLabelText(/name/i);
    expect(nameHeader).toHaveStyle({ flex: '0 0 auto', width: '120px' });
  });

  it('getRowSpacing 作用于行 margin', () => {
    render(
      <DataTable data={data} columns={columns} getRowSpacing={() => ({ top: 8, bottom: 4 })} />,
    );
    const firstRow = document.querySelector('.uikit-dt__row');
    expect(firstRow).toHaveStyle({ marginTop: '8px', marginBottom: '4px' });
  });

  it('固定列应用 sticky 样式', () => {
    const cols: DataTableColumn<Row>[] = [
      { key: 'id', accessor: 'id', header: 'ID', width: 50, fixed: 'left' },
      { key: 'name', accessor: 'name', header: 'Name', width: 120 },
    ];
    render(<DataTable data={data} columns={cols} slots={testSlots} />);
    expect(screen.getByLabelText(/id/i)).toHaveStyle({
      position: 'sticky',
      left: '0px',
      background: 'var(--uikit-dt-header-bg)',
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
    const dataRows = document.querySelectorAll('.uikit-dt__body > section');
    expect(dataRows).toHaveLength(2);
    expect(dataRows[0].tagName).toBe('SECTION');
    expect(dataRows[0]).toHaveAttribute('data-custom', 'row');
    expect(dataRows[0]).not.toHaveClass('uikit-dt__row');
    expect(document.querySelector('section.uikit-dt__header-row')).toBeNull();
  });
});
