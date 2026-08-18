import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Cell } from '../src/components/Cell';
import { Grid } from '../src/components/Grid';
import type { GridRow } from '../src/types/grid';
import '../src/styles/grid.css';

interface Row extends GridRow {
  id: number;
  name: string;
}

const columns = [
  { key: 'id', width: 80, fixed: 'start' as const },
  { key: 'name', width: 120 },
  { key: 'score', width: 80, fixed: 'end' as const },
];

const headerRow: Row = { id: -1, name: 'Name', fixed: 'start' };
const bodyRows: Row[] = Array.from({ length: 100 }, (_, id) => ({ id, name: `row-${id}` }));

const clientWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
const clientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');

function stubViewport(width = 400, height = 300) {
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
  if (clientWidthDesc) Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDesc);
  if (clientHeightDesc)
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDesc);
}

afterEach(() => {
  cleanup();
  restoreViewport();
});

describe('Grid', () => {
  it('renders only viewport cells plus frozen bands', () => {
    stubViewport();

    render(
      <Grid
        style={{ width: 400, height: 300 }}
        columns={columns}
        data={[headerRow, ...bodyRows]}
        rowHeight={(row) => (row.fixed === 'start' ? 40 : 32)}
      >
        {({ column, row }) => <Cell>{String(row[column.key as keyof Row] ?? '')}</Cell>}
      </Grid>,
    );

    const cells = document.querySelectorAll('.uikit-grid__cell');
    expect(cells.length).toBeLessThan(50);
    expect(cells.length).toBeGreaterThan(0);
  });

  it('scrolls vertically via wheel', () => {
    stubViewport();

    render(
      <Grid style={{ width: 400, height: 120 }} columns={columns} data={bodyRows}>
        {({ column, row }) => <Cell>{String(row[column.key as keyof Row] ?? '')}</Cell>}
      </Grid>,
    );

    const scroller = screen.getByTestId('grid-scroller');
    fireEvent.wheel(scroller, { deltaY: 500 });

    expect(document.querySelectorAll('.uikit-grid__cell').length).toBeGreaterThan(0);
  });
});
