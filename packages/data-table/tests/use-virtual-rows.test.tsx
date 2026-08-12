import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useVirtualRows, type VirtualRow } from '../src/hooks/use-virtual-rows';

/** 测试 harness: 把 containerRef 绑到真实 div,便于设置 clientHeight 与派发滚动 */
function Harness(props: {
  count: number;
  rowHeight: number;
  spacing?: { top: number; bottom: number };
  overscan?: number;
  onRender?: (items: VirtualRow[]) => void;
}) {
  const { containerRef, totalHeight, start, end, virtualItems } = useVirtualRows(props);
  props.onRender?.(virtualItems);
  return (
    <div>
      <div ref={containerRef} data-testid="container" />
      <div data-testid="total">{totalHeight}</div>
      <div data-testid="range">{`${start}-${end}`}</div>
    </div>
  );
}

function renderHarness(props: Parameters<typeof Harness>[0]) {
  const onRender = props.onRender ?? (() => {});
  render(<Harness {...props} onRender={onRender} />);
  const container = screen.getByTestId('container');
  // jsdom 中 clientHeight 只读,这里定义成可配置;随后派发一次 scroll 触发重测
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: 300 });
  fireEvent.scroll(container);
  return { container };
}

describe('useVirtualRows', () => {
  it('初始可见范围与总高度', () => {
    let items: VirtualRow[] = [];
    renderHarness({
      count: 100,
      rowHeight: 30,
      overscan: 5,
      onRender: (v) => {
        items = v;
      },
    });
    expect(screen.getByTestId('total')).toHaveTextContent('3000');
    expect(screen.getByTestId('range')).toHaveTextContent('0-16');
    expect(items[0]).toMatchObject({ index: 0, offsetTop: 0 });
  });

  it('滚动后范围前移,offsetTop 按行高累计', () => {
    let items: VirtualRow[] = [];
    const { container } = renderHarness({
      count: 100,
      rowHeight: 30,
      overscan: 5,
      onRender: (v) => {
        items = v;
      },
    });
    container.scrollTop = 600;
    fireEvent.scroll(container);
    expect(screen.getByTestId('range')).toHaveTextContent('15-36');
    expect(items[0]).toMatchObject({ index: 15, offsetTop: 450 });
  });

  it('spacing 计入行高、总高度与 offsetTop(首行含上间距)', () => {
    let items: VirtualRow[] = [];
    renderHarness({
      count: 100,
      rowHeight: 30,
      spacing: { top: 8, bottom: 8 },
      overscan: 5,
      onRender: (v) => {
        items = v;
      },
    });
    // effective = 30 + 8 + 8 = 46
    expect(screen.getByTestId('total')).toHaveTextContent('4600');
    expect(items[0]).toMatchObject({ index: 0, offsetTop: 8, spacingTop: 8, spacingBottom: 8 });
    // visibleCount = ceil(300/46)+1 = 8, end = 8 + 5 = 13
    expect(screen.getByTestId('range')).toHaveTextContent('0-13');
  });

  it('空数据安全', () => {
    renderHarness({ count: 0, rowHeight: 30 });
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('range')).toHaveTextContent('0-0');
  });

  it('viewport 高度大于内容时不越界', () => {
    renderHarness({ count: 5, rowHeight: 30 });
    // 内容总高 150 < viewport 300,可见范围覆盖全部
    expect(screen.getByTestId('range')).toHaveTextContent('0-5');
  });
});
