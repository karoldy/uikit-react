import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGridDimensions } from '../src/hooks/use-grid-dimensions';

/** 测试 harness: 把 ref 绑到 div，并 stub clientWidth/clientHeight（callback ref 在 layout effect 之前执行） */
function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useGridDimensions(ref);

  return (
    <div
      ref={(node) => {
        if (node) {
          Object.defineProperty(node, 'clientWidth', { configurable: true, value: 400 });
          Object.defineProperty(node, 'clientHeight', { configurable: true, value: 300 });
        }
        ref.current = node;
      }}
      data-testid="root"
    >
      <span data-testid="size">{`${width}x${height}`}</span>
    </div>
  );
}

describe('useGridDimensions', () => {
  it('mount 后读到 stub 的 400×300', () => {
    render(<Harness />);
    expect(screen.getByTestId('size')).toHaveTextContent('400x300');
  });
});
