import { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useScrollState } from '../src/hooks/use-scroll-state';

/** 测试 harness: 把 ref 绑到滚动容器 div */
function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollTop, scrollLeft } = useScrollState(ref);

  return (
    <div ref={ref} data-testid="root">
      <span data-testid="scrollTop">{scrollTop}</span>
      <span data-testid="scrollLeft">{scrollLeft}</span>
    </div>
  );
}

describe('useScrollState', () => {
  it('scrollTop/scrollLeft 随滚动更新', () => {
    render(<Harness />);
    const root = screen.getByTestId('root');
    root.scrollTop = 120;
    root.scrollLeft = 80;
    fireEvent.scroll(root);
    expect(screen.getByTestId('scrollTop')).toHaveTextContent('120');
    expect(screen.getByTestId('scrollLeft')).toHaveTextContent('80');
  });

  it('scrollLeft 取绝对值（RTL）', () => {
    render(<Harness />);
    const root = screen.getByTestId('root');
    root.scrollLeft = -40;
    fireEvent.scroll(root);
    expect(screen.getByTestId('scrollLeft')).toHaveTextContent('40');
  });
});
