import { afterEach, describe, expect, it, vi } from 'vitest';
import { syncTextareaHeight } from '../src/sync-textarea-height';

function mockTextarea(scrollHeight: number) {
  const style: Record<string, string> = {};
  return {
    style,
    scrollHeight,
  } as unknown as HTMLTextAreaElement;
}

describe('syncTextareaHeight', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grows with content and hides overflow when maxRows is omitted', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize: '16px',
      lineHeight: '23px',
      paddingTop: '16.5px',
      paddingBottom: '16.5px',
    } as CSSStyleDeclaration);

    const el = mockTextarea(200);
    syncTextareaHeight(el, 2, undefined);

    expect(el.style.height).toBe('200px');
    expect(el.style.overflowY).toBe('hidden');
  });

  it('does not shrink below minRows', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize: '16px',
      lineHeight: '23px',
      paddingTop: '16.5px',
      paddingBottom: '16.5px',
    } as CSSStyleDeclaration);

    const el = mockTextarea(20);
    syncTextareaHeight(el, 2, undefined);

    // 2 * 23 + 16.5 + 16.5
    expect(el.style.height).toBe('79px');
  });

  it('caps height and scrolls once content exceeds maxRows', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize: '16px',
      lineHeight: '23px',
      paddingTop: '16.5px',
      paddingBottom: '16.5px',
    } as CSSStyleDeclaration);

    const el = mockTextarea(300);
    syncTextareaHeight(el, 2, 4);

    // 4 * 23 + 16.5 + 16.5
    expect(el.style.height).toBe('125px');
    expect(el.style.overflowY).toBe('auto');
  });
});
