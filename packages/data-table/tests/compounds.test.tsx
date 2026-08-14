import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { TableRoot } from '../src/components/TableRoot';
import { TableHeader } from '../src/components/TableHeader';
import { TableHeaderRow } from '../src/components/TableHeaderRow';
import { TableHeaderCell } from '../src/components/TableHeaderCell';
import { TableBody } from '../src/components/TableBody';
import { TableRow } from '../src/components/TableRow';
import { TableCell } from '../src/components/TableCell';
import { useTableContext } from '../src/components/table-context';
import type { TableCellSlotProps, TableHeaderCellSlotProps } from '../src/types';

function Probe() {
  const ctx = useTableContext<{ id: number }>();
  return <span data-testid="count">{ctx.sortedRows.length}</span>;
}

it('provides sortedRows to compounds', () => {
  render(
    <TableRoot
      data={[{ id: 1 }, { id: 2 }]}
      columns={[{ key: 'id', accessor: 'id', header: 'ID' }]}
    >
      <Probe />
    </TableRoot>,
  );
  expect(screen.getByTestId('count')).toHaveTextContent('2');
});

it('HeaderCell toggles sort and custom slot receives sorted', async () => {
  const seen: Array<string | false> = [];
  function Slot(props: TableHeaderCellSlotProps) {
    const {
      sorted,
      label: _label,
      sortable: _sortable,
      column: _column,
      fixed: _fixed,
      children,
      ...rest
    } = props;
    seen.push(sorted);
    return <div {...rest}>{children}</div>;
  }
  const user = userEvent.setup();
  render(
    <TableRoot
      data={[{ name: 'bob' }, { name: 'alice' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      slots={{ headerCell: Slot }}
    >
      <TableHeader>
        <TableHeaderRow>
          <TableHeaderCell columnKey="name" />
        </TableHeaderRow>
      </TableHeader>
    </TableRoot>,
  );
  await user.click(screen.getByRole('button'));
  expect(seen).toContain('asc');
});

it('does not set aria-sort on default header cell', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      sort={{ columnKey: 'name', direction: 'asc' }}
    >
      <TableHeader>
        <TableHeaderRow>
          <TableHeaderCell columnKey="name" />
        </TableHeaderRow>
      </TableHeader>
    </TableRoot>,
  );
  const cell = document.querySelector('.uikit-dt__header-cell');
  expect(cell).not.toBeNull();
  expect(cell).not.toHaveAttribute('aria-sort');
  expect(cell).not.toHaveAttribute('role');
  expect(cell).not.toHaveAttribute('sorted');
  expect(cell).not.toHaveAttribute('sortable');
  expect(cell).not.toHaveAttribute('label');
  expect(cell).not.toHaveAttribute('fixed');
});

it('default header sort uses inset classes, not arrow glyphs', async () => {
  const user = userEvent.setup();
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableHeader>
        <TableHeaderRow>
          <TableHeaderCell columnKey="name" />
        </TableHeaderRow>
      </TableHeader>
    </TableRoot>,
  );
  const cell = document.querySelector('.uikit-dt__header-cell');
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(cell?.textContent).not.toMatch(/[↑↓⇅]/);
  await user.click(screen.getByRole('button'));
  expect(cell).toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(cell?.textContent).not.toMatch(/[↑↓⇅]/);
  await user.click(screen.getByRole('button'));
  expect(cell).toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  await user.click(screen.getByRole('button'));
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(cell).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
});

it('renders null when columnKey is missing', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableHeader>
        <TableHeaderRow>
          <TableHeaderCell columnKey="missing" />
        </TableHeaderRow>
      </TableHeader>
    </TableRoot>,
  );
  expect(document.querySelector('.uikit-dt__header-cell')).toBeNull();
});

it('Body default-renders rows and Cell shows stringified value', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }, { name: 'alice' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableBody />
    </TableRoot>,
  );
  expect(screen.getByText('bob')).toBeInTheDocument();
  expect(screen.getByText('alice')).toBeInTheDocument();
  expect(document.querySelectorAll('.uikit-dt__row')).toHaveLength(2);
  expect(document.querySelectorAll('.uikit-dt__cell')).toHaveLength(2);
});

it('custom cell slot receives value', () => {
  const seen: unknown[] = [];
  function Slot(props: TableCellSlotProps) {
    const { value, row: _row, index: _index, column: _column, children, ...rest } = props;
    seen.push(value);
    return <div {...rest}>{children}</div>;
  }
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      slots={{ cell: Slot }}
    >
      <TableBody />
    </TableRoot>,
  );
  expect(seen).toContain('bob');
  expect(document.querySelector('.uikit-dt__cell')).toBeNull();
});

it('applies getRowSpacing margin on row, not cell', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      getRowSpacing={() => ({ top: 8, bottom: 4 })}
    >
      <TableBody />
    </TableRoot>,
  );
  const row = document.querySelector('.uikit-dt__row');
  const cell = document.querySelector('.uikit-dt__cell');
  expect(row).toHaveStyle({ marginTop: '8px', marginBottom: '4px' });
  expect((cell as HTMLElement).style.marginTop).toBe('');
  expect((cell as HTMLElement).style.paddingTop).toBe('');
});

it('does not leak value onto default cell', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableBody />
    </TableRoot>,
  );
  const cell = document.querySelector('.uikit-dt__cell');
  expect(cell).not.toBeNull();
  expect(cell).not.toHaveAttribute('value');
  expect(cell).not.toHaveAttribute('row');
  expect(cell).not.toHaveAttribute('index');
  expect(cell).not.toHaveAttribute('column');
});

it('renders null when Cell columnKey is missing', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableBody>
        <TableRow index={0}>
          <TableCell columnKey="missing" />
        </TableRow>
      </TableBody>
    </TableRoot>,
  );
  expect(document.querySelector('.uikit-dt__cell')).toBeNull();
});

it('renders null when Row index is missing', () => {
  render(
    <TableRoot
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableBody>
        <TableRow index={99}>
          <TableCell columnKey="name" />
        </TableRow>
      </TableBody>
    </TableRoot>,
  );
  expect(document.querySelector('.uikit-dt__row')).toBeNull();
});
