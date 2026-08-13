import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultSlotClass } from '../src/components/default-slot-class';
import { renderSlot } from '../src/components/render-slot';
import { columnStyle } from '../src/utils/column-style';

describe('renderSlot', () => {
  it('renders the fallback when slot is undefined', () => {
    render(renderSlot(undefined, 'div', { className: 'x' }, 'hi'));
    expect(screen.getByText('hi').tagName).toBe('DIV');
  });
});

describe('defaultSlotClass', () => {
  it('returns the BEM class for the built-in fallback', () => {
    expect(defaultSlotClass(false, undefined, 'uikit-dt__cell')).toBe('uikit-dt__cell');
  });

  it('returns false when the caller provided a slot', () => {
    expect(defaultSlotClass(false, 'section', 'uikit-dt__cell')).toBe(false);
    function Slot() {
      return null;
    }
    expect(defaultSlotClass(false, Slot, 'uikit-dt__cell')).toBe(false);
  });

  it('returns false when className is false', () => {
    expect(defaultSlotClass(false, undefined, false)).toBe(false);
  });
});

describe('columnStyle', () => {
  it('uses flex-grow when flex is set', () => {
    const style = columnStyle(
      { key: 'a', accessor: 'a', header: 'A', flex: 1, width: 80 },
      undefined,
    );
    expect(style.flexGrow).toBe(1);
    expect(style.flexBasis).toBe('80px');
  });

  it('uses fixed width when flex is omitted', () => {
    const style = columnStyle({ key: 'a', accessor: 'a', header: 'A', width: 120 }, undefined);
    expect(style.flex).toBe('0 0 auto');
    expect(style.width).toBe('120px');
  });
});
