import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VirtualTable } from '../src/VirtualTable';
import type { VirtualTableColumn } from '../src/types';

interface Row {
  id: number;
  name: string;
  score: number;
}

const cols: VirtualTableColumn<Row>[] = [
  { key: 'id', accessor: 'id', header: 'ID', width: 80, fixed: 'left' },
  { key: 'name', accessor: 'name', header: 'Name', width: 120 },
  { key: 'score', accessor: 'score', header: 'Score', width: 80 },
];

const rows100: Row[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `name-${i}`,
  score: 100 - i,
}));

interface WideRow {
  id: number;
  [key: string]: number;
}

const wideColumns: VirtualTableColumn<WideRow>[] = [
  { key: 'id', accessor: 'id', header: 'ID', width: 80, fixed: 'left' },
  ...Array.from({ length: 20 }, (_, i) => ({
    key: `c${i}`,
    accessor: `c${i}`,
    header: `C${i}`,
    width: 120,
  })),
];

const wideRows: WideRow[] = Array.from({ length: 10 }, (_, i) => {
  const row: WideRow = { id: i };
  for (let c = 0; c < 20; c++) row[`c${c}`] = i * 100 + c;
  return row;
});

const clientWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
const clientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');

/** Stub Root client size on the prototype so the first layout measure sees 400×300. */
function stubViewport(size: { width?: number; height?: number } = {}) {
  const width = size.width ?? 400;
  const height = size.height ?? 300;
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return width;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return height;
    },
  });
}

function restoreViewport() {
  if (clientWidthDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDesc);
  }
  if (clientHeightDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDesc);
  }
}

afterEach(() => {
  cleanup();
  restoreViewport();
});

describe('VirtualTable', () => {
  it('只渲染可见行，不是全部', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable data={rows100} columns={cols} rowHeight={30} height={300} overscan={4} />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    const rowCount = root.querySelectorAll('.uikit-vt__row').length;
    expect(rowCount).toBeLessThan(100);
    expect(rowCount).toBeGreaterThan(0);
  });

  it('只渲染可见列，冻结列始终在', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable
        data={wideRows}
        columns={wideColumns}
        rowHeight={30}
        height={300}
        overscan={4}
      />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    const headerCells = root.querySelectorAll('.uikit-vt__header-cell');
    expect(headerCells.length).toBeLessThan(21);
    expect(root.textContent).toContain('ID');
  });

  it('横向滚动后出现更右边的列', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable
        data={wideRows}
        columns={wideColumns}
        rowHeight={30}
        height={300}
        overscan={4}
      />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    expect(root.textContent).not.toContain('C10');
    root.scrollLeft = 800;
    fireEvent.scroll(root);
    expect(root.textContent).toContain('C10');
    expect(root.textContent).toContain('ID');
  });

  it('纵向滚动后渲染新的可见行', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable data={rows100} columns={cols} rowHeight={30} height={300} overscan={4} />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    root.scrollTop = 600;
    fireEvent.scroll(root);
    const rows = root.querySelectorAll('.uikit-vt__row');
    expect(rows[0]).toHaveTextContent('name-16');
    expect(root.textContent).not.toContain('name-0');
  });

  it('排序后虚拟区间基于排序结果', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable data={rows100} columns={cols} rowHeight={30} height={300} overscan={4} />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    fireEvent.click(screen.getByRole('button', { name: 'Score' }));
    const rows = root.querySelectorAll('.uikit-vt__row');
    expect(rows[0]).toHaveTextContent('name-99');
  });

  it('onSortChange 收到数组', () => {
    const onSortChange = vi.fn();
    stubViewport({ width: 400, height: 300 });
    render(
      <VirtualTable
        data={rows100}
        columns={cols}
        rowHeight={30}
        height={300}
        overscan={4}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'ID' }));
    expect(onSortChange).toHaveBeenCalledWith([{ columnKey: 'id', direction: 'asc' }]);
  });

  it('getRowSpacing 计入轨道高度并打在行 padding', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable
        data={rows100}
        columns={cols}
        rowHeight={30}
        height={300}
        overscan={4}
        getRowSpacing={() => ({ top: 8, bottom: 8 })}
      />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    const row = root.querySelector('.uikit-vt__row') as HTMLElement;
    expect(row).toHaveStyle({ paddingTop: '8px', paddingBottom: '8px' });
    expect(root.querySelectorAll('.uikit-vt__row').length).toBeLessThanOrEqual(15);
  });

  it('空数据仍渲染表头', () => {
    stubViewport({ width: 400, height: 300 });
    const { container } = render(
      <VirtualTable data={[]} columns={cols} rowHeight={30} height={300} />,
    );
    const root = container.querySelector('.uikit-vt') as HTMLElement;
    expect(root.querySelector('.uikit-vt__header-row')).not.toBeNull();
    expect(root.querySelectorAll('.uikit-vt__row').length).toBe(0);
    expect(screen.getByRole('button', { name: 'ID' })).toBeInTheDocument();
  });
});
