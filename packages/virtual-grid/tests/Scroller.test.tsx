import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Scroller } from '../src/components/Scroller';

describe('Scroller', () => {
  it('updates scroll position on wheel', () => {
    const onScrollTop = vi.fn();

    render(
      <Scroller
        width={200}
        height={100}
        scrollWidth={200}
        scrollHeight={400}
        scrollLeft={0}
        scrollTop={0}
        onScrollLeft={() => {}}
        onScrollTop={onScrollTop}
      >
        <div data-testid="content" />
      </Scroller>,
    );

    fireEvent.wheel(screen.getByTestId('grid-scroller'), { deltaY: 200 });
    expect(onScrollTop).toHaveBeenCalledWith(60);
  });

  it('clamps scroll position to max', () => {
    const onScrollTop = vi.fn();

    render(
      <Scroller
        width={200}
        height={100}
        scrollWidth={200}
        scrollHeight={400}
        scrollLeft={0}
        scrollTop={280}
        onScrollLeft={() => {}}
        onScrollTop={onScrollTop}
      >
        <div />
      </Scroller>,
    );

    fireEvent.wheel(screen.getByTestId('grid-scroller'), { deltaY: 10_000 });
    expect(onScrollTop).toHaveBeenCalledWith(300);
  });
});
