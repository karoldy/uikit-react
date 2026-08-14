import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HTMLAttributes, ReactNode } from 'react';
import { Table } from '../src/components/Table';
import { resolveLoading } from '../src/types/loading';
import type { TableColumn, TableLoadingRowSlotProps } from '../src/types';

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

describe('resolveLoading', () => {
  it('无 loading 为 false', () => {
    expect(resolveLoading(undefined, false)).toBe(false);
    expect(resolveLoading(false, true)).toBe(false);
  });

  it('无数据时 line 回退为 row', () => {
    expect(resolveLoading('line', false)).toBe('row');
  });

  it('有数据时四种都保留', () => {
    expect(resolveLoading('row', true)).toBe('row');
    expect(resolveLoading('cell', true)).toBe('cell');
    expect(resolveLoading('line', true)).toBe('line');
    expect(resolveLoading('spin', true)).toBe('spin');
  });

  it('无数据时 spin 保留', () => {
    expect(resolveLoading('spin', false)).toBe('spin');
  });
});

describe('Table loading', () => {
  it('无数据 loading=row 渲染默认 12 行骨架，没有真实单元格文案', () => {
    render(<Table data={[]} columns={columns} loading="row" />);
    expect(document.querySelectorAll('.uikit-dt__skeleton--row')).toHaveLength(12);
    expect(document.querySelectorAll('.uikit-dt__cell .uikit-dt__skeleton')).toHaveLength(0);
    expect(screen.queryByText('bob')).not.toBeInTheDocument();
  });

  it('无数据 loading=cell 按列渲染单元格骨架', () => {
    render(<Table data={[]} columns={columns} loading="cell" />);
    expect(document.querySelectorAll('.uikit-dt__row')).toHaveLength(12);
    expect(document.querySelectorAll('.uikit-dt__cell .uikit-dt__skeleton')).toHaveLength(24);
    expect(document.querySelectorAll('.uikit-dt__skeleton--row')).toHaveLength(0);
  });

  it('skeletonRows 覆盖默认行数', () => {
    render(<Table data={[]} columns={columns} loading="row" skeletonRows={3} />);
    expect(document.querySelectorAll('.uikit-dt__skeleton--row')).toHaveLength(3);
  });

  it('无数据 loading=line 回退为 row 骨架', () => {
    render(<Table data={[]} columns={columns} loading="line" />);
    expect(document.querySelector('.uikit-dt__loading-line')).toBeNull();
    expect(document.querySelectorAll('.uikit-dt__skeleton--row')).toHaveLength(12);
  });

  it('有数据 loading=line 保留行并在表头底部画线', () => {
    render(<Table data={data} columns={columns} loading="line" />);
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(document.querySelector('.uikit-dt__loading-line')).not.toBeNull();
    expect(document.querySelectorAll('.uikit-dt__skeleton')).toHaveLength(0);
  });

  it('有数据 loading=row 用数据行数渲染行骨架，不展示原值', () => {
    render(<Table data={data} columns={columns} loading="row" />);
    expect(screen.queryByText('bob')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.uikit-dt__skeleton--row')).toHaveLength(2);
  });

  it('有数据 loading=cell 用数据行数渲染单元格骨架', () => {
    render(<Table data={data} columns={columns} loading="cell" />);
    expect(screen.queryByText('bob')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.uikit-dt__cell .uikit-dt__skeleton')).toHaveLength(4);
  });

  it('未设 loading 不渲染骨架、表头线和 spin', () => {
    render(<Table data={data} columns={columns} />);
    expect(document.querySelector('.uikit-dt__skeleton')).toBeNull();
    expect(document.querySelector('.uikit-dt__loading-line')).toBeNull();
    expect(document.querySelector('.uikit-dt__spin')).toBeNull();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('无数据 loading=spin 在 body 中央渲染转圈，没有骨架', () => {
    render(<Table data={[]} columns={columns} loading="spin" />);
    expect(document.querySelector('.uikit-dt__body .uikit-dt__spin')).not.toBeNull();
    expect(document.querySelectorAll('.uikit-dt__skeleton')).toHaveLength(0);
    expect(screen.queryByText('bob')).not.toBeInTheDocument();
  });

  it('有数据 loading=spin 保留行并在 body 中央转圈', () => {
    render(<Table data={data} columns={columns} loading="spin" />);
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(document.querySelector('.uikit-dt__body .uikit-dt__spin')).not.toBeNull();
  });

  it('loadingRow slot 替换整行骨架并收到 count', () => {
    const seen: number[] = [];
    function Slot({ count, columns: _columns, children, ...rest }: TableLoadingRowSlotProps) {
      seen.push(count);
      return (
        <div data-testid="loading-row" {...rest}>
          {children}
        </div>
      );
    }
    render(<Table data={[]} columns={columns} loading="row" slots={{ loadingRow: Slot }} />);
    expect(screen.getByTestId('loading-row')).toBeInTheDocument();
    expect(seen).toEqual([12]);
    expect(document.querySelector('.uikit-dt__skeleton--row')).toBeNull();
  });

  it('loadingCell slot 替换单元格骨架', () => {
    function Slot({ count: _count, columns: _columns, ...rest }: TableLoadingRowSlotProps) {
      return <div data-testid="loading-cell" {...rest} />;
    }
    render(<Table data={[]} columns={columns} loading="cell" slots={{ loadingCell: Slot }} />);
    expect(screen.getByTestId('loading-cell')).toBeInTheDocument();
    expect(document.querySelectorAll('.uikit-dt__cell .uikit-dt__skeleton')).toHaveLength(0);
  });

  it('loadingLine slot 替换表头运动线', () => {
    function Slot(props: HTMLAttributes<HTMLElement>) {
      return <div data-testid="loading-line" {...props} />;
    }
    render(<Table data={data} columns={columns} loading="line" slots={{ loadingLine: Slot }} />);
    expect(screen.getByTestId('loading-line')).toBeInTheDocument();
    expect(document.querySelector('.uikit-dt__loading-line')).toBeNull();
  });

  it('loadingSpin slot 替换中央转圈', () => {
    function Slot({ children, ...rest }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
      return (
        <div data-testid="loading-spin" {...rest}>
          {children}
        </div>
      );
    }
    render(<Table data={data} columns={columns} loading="spin" slots={{ loadingSpin: Slot }} />);
    expect(screen.getByTestId('loading-spin')).toBeInTheDocument();
    expect(document.querySelector('.uikit-dt__spin')).toBeNull();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });
});
