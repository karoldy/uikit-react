import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { composeClickHandlers } from '../src/components/compose-click-handlers';
import { renderSlot } from '../src/components/render-slot';
import { resolveAnimationClassNames } from '../src/utils/animation-classes';
import { cx } from '../src/utils/cx';

describe('cx', () => {
  it('joins truthy class names', () => {
    expect(cx('a', false, null, undefined, 'b', '')).toBe('a b');
  });
});

describe('resolveAnimationClassNames', () => {
  it('returns empty when animation is disabled', () => {
    expect(resolveAnimationClassNames(false, false, undefined, 'up', 'enlarge')).toEqual([]);
  });

  it('uses default class names when styles are enabled', () => {
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
    expect(resolveAnimationClassNames(true, false, undefined, null, 'reduce')).toEqual([
      false,
      false,
      false,
      'uikit-cal__grid--reduce',
    ]);
  });

  it('omits defaults when disableDefaultStyles is set without custom names', () => {
    expect(resolveAnimationClassNames(true, true, undefined, 'up', 'enlarge')).toEqual([
      undefined,
      false,
      undefined,
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

  it('skips internal when defaultPrevented', async () => {
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
  it('renders the fallback element when no slot is provided', () => {
    render(renderSlot(undefined, 'div', { 'data-testid': 'fallback' }, 'content'));
    expect(screen.getByTestId('fallback')).toHaveTextContent('content');
  });

  it('renders a custom slot element', () => {
    const Slot = (props: React.ComponentProps<'section'>) =>
      createElement('section', { ...props, 'data-testid': 'custom' });

    render(renderSlot(Slot, 'div', { className: 'slot' }, 'inside'));
    expect(screen.getByTestId('custom')).toHaveClass('slot');
    expect(screen.getByTestId('custom')).toHaveTextContent('inside');
  });
});
