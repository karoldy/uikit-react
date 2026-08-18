import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SortState } from '@uikit-react/hooks';
import { HCell } from '../src/components/HCell';

describe('HCell', () => {
  it('cycles single-column sort: none -> asc -> desc -> none', () => {
    const onSortChange = vi.fn();

    const { rerender } = render(
      <HCell name="name" sort={[]} onSortChange={onSortChange}>
        Name
      </HCell>,
    );

    fireEvent.click(renderResultButton());
    expect(onSortChange).toHaveBeenLastCalledWith([{ columnKey: 'name', direction: 'asc' }]);

    rerender(
      <HCell
        name="name"
        sort={[{ columnKey: 'name', direction: 'asc' }]}
        onSortChange={onSortChange}
      >
        Name
      </HCell>,
    );
    fireEvent.click(renderResultButton());
    expect(onSortChange).toHaveBeenLastCalledWith([{ columnKey: 'name', direction: 'desc' }]);

    rerender(
      <HCell
        name="name"
        sort={[{ columnKey: 'name', direction: 'desc' }]}
        onSortChange={onSortChange}
      >
        Name
      </HCell>,
    );
    fireEvent.click(renderResultButton());
    expect(onSortChange).toHaveBeenLastCalledWith([]);

    function renderResultButton() {
      return document.querySelector('button.uikit-grid__hcell-button') as HTMLButtonElement;
    }
  });

  it('Shift+click appends this column in multi mode', () => {
    const onSortChange = vi.fn();

    render(
      <HCell
        name="name"
        sort={[{ columnKey: 'other', direction: 'asc' }] as SortState}
        onSortChange={onSortChange}
      >
        Name
      </HCell>,
    );

    const button = document.querySelector('button.uikit-grid__hcell-button') as HTMLButtonElement;
    fireEvent.click(button, { shiftKey: true });
    expect(onSortChange).toHaveBeenLastCalledWith([
      { columnKey: 'other', direction: 'asc' },
      { columnKey: 'name', direction: 'asc' },
    ]);
  });
});
