import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { composeClickHandlers } from '../src/components/compose-click-handlers';
import { renderSlot } from '../src/components/render-slot';
import {
  resolveAnimationClassNames,
  resolveMonthSlideClassNames,
  resolveViewTransitionClassNames,
} from '../src/utils/animation-classes';
import { cx } from '../src/utils/cx';

describe('cx', () => {
  it('joins truthy class names', () => {
    expect(cx('a', false, null, undefined, 'b', '')).toBe('a b');
  });
});

describe('resolveMonthSlideClassNames', () => {
  it('returns empty when animation is disabled', () => {
    expect(resolveMonthSlideClassNames(false, false, undefined, 'up')).toEqual([]);
  });

  it('uses days slide class names by default', () => {
    expect(resolveMonthSlideClassNames(true, false, undefined, 'up')).toEqual([
      'uikit-cal__days--up',
      false,
    ]);
    expect(resolveMonthSlideClassNames(true, false, undefined, 'down')).toEqual([
      false,
      'uikit-cal__days--down',
    ]);
  });
});

describe('resolveViewTransitionClassNames', () => {
  it('uses grid enlarge/reduce class names by default', () => {
    expect(resolveViewTransitionClassNames(true, false, undefined, 'enlarge')).toEqual([
      'uikit-cal__grid--enlarge',
      false,
    ]);
    expect(resolveViewTransitionClassNames(true, false, undefined, 'reduce')).toEqual([
      false,
      'uikit-cal__grid--reduce',
    ]);
  });
});

describe('resolveAnimationClassNames', () => {
  it('returns empty when animation is disabled', () => {
    expect(resolveAnimationClassNames(false, false, undefined, 'up', 'enlarge')).toEqual([]);
  });

  it('uses panel slide + view classes for year/month containers', () => {
    expect(resolveAnimationClassNames(true, false, undefined, 'up', null)).toEqual([
      'uikit-cal__grid--up',
      false,
      false,
      false,
    ]);
    expect(resolveAnimationClassNames(true, false, undefined, 'down', 'enlarge')).toEqual([
      false,
      'uikit-cal__grid--down',
      'uikit-cal__grid--enlarge',
      false,
    ]);
  });

  it('prefers custom animation class names', () => {
    expect(
      resolveAnimationClassNames(
        true,
        true,
        { up: 'custom-up', enlarge: 'custom-enlarge' },
        'up',
        'enlarge',
      ),
    ).toEqual(['custom-up', false, 'custom-enlarge', false]);
  });
});

describe('composeClickHandlers', () => {
  it('runs external then internal handlers', async () => {
    const user = userEvent.setup();
    const external = vi.fn();
    const internal = vi.fn();
    const onClick = composeClickHandlers(external, internal);

    render(<button onClick={onClick}>Go</button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));

    expect(external).toHaveBeenCalledOnce();
    expect(internal).toHaveBeenCalledOnce();
    expect(external.mock.invocationCallOrder[0]).toBeLessThan(
      internal.mock.invocationCallOrder[0]!,
    );
  });

  it('skips internal handler when defaultPrevented', async () => {
    const user = userEvent.setup();
    const internal = vi.fn();
    const onClick = composeClickHandlers((event) => {
      event.preventDefault();
    }, internal);

    render(<button onClick={onClick}>Go</button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));

    expect(internal).not.toHaveBeenCalled();
  });
});

describe('renderSlot', () => {
  it('renders the fallback element when slot is undefined', () => {
    render(renderSlot(undefined, 'div', { 'data-testid': 'fallback' }, 'content'));
    expect(screen.getByTestId('fallback')).toHaveTextContent('content');
  });

  it('renders a custom slot component', () => {
    const Slot = (props: React.HTMLAttributes<HTMLElement>) =>
      createElement('section', { ...props, 'data-testid': 'custom' });
    render(renderSlot(Slot, 'div', { className: 'x' }, 'hi'));
    expect(screen.getByTestId('custom')).toHaveTextContent('hi');
  });
});
