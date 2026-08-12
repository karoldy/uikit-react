import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defaultPageList, Pagination } from '../src/components/Pagination';

describe('defaultPageList', () => {
  it('短列表全部展示', () => {
    expect(defaultPageList(1, 3)).toEqual([1, 2, 3]);
  });

  it('长列表折叠为省略号', () => {
    expect(defaultPageList(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  it('首页附近', () => {
    expect(defaultPageList(1, 10)).toEqual([1, 2, 'ellipsis', 10]);
  });
});

describe('Pagination', () => {
  it('渲染上一页/页码/下一页,aria-current 标记当前页', () => {
    render(<Pagination page={3} pageCount={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2 + 5); // prev + 5 pages + next
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('首尾禁用上一页/下一页', () => {
    render(<Pagination page={1} pageCount={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('点击页码与下一页触发 onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('slots 可替换元素', () => {
    render(<Pagination page={1} pageCount={3} onPageChange={vi.fn()} slots={{ root: 'nav' }} />);
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(5);
  });

  it('renderPageLabel 自定义', () => {
    render(
      <Pagination page={1} pageCount={2} onPageChange={vi.fn()} renderPageLabel={(p) => `P${p}`} />,
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveTextContent('P1');
  });
});
