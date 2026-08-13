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
      markup="div"
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
      markup="div"
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

it('does not set aria-sort on native th', () => {
  render(
    <TableRoot
      markup="native"
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
  const th = document.querySelector('th');
  expect(th).not.toBeNull();
  expect(th).not.toHaveAttribute('aria-sort');
  expect(th).not.toHaveAttribute('role');
  expect(th).not.toHaveAttribute('sorted');
  expect(th).not.toHaveAttribute('sortable');
  expect(th).not.toHaveAttribute('label');
  expect(th).not.toHaveAttribute('fixed');
});

it('default header sort uses inset classes, not arrow glyphs', async () => {
  const user = userEvent.setup();
  render(
    <TableRoot
      markup="native"
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
  const th = document.querySelector('th');
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(th?.textContent).not.toMatch(/[↑↓⇅]/);
  await user.click(screen.getByRole('button'));
  expect(th).toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(th?.textContent).not.toMatch(/[↑↓⇅]/);
  await user.click(screen.getByRole('button'));
  expect(th).toHaveClass('uikit-dt__header-cell--sorted-desc');
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  await user.click(screen.getByRole('button'));
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-asc');
  expect(th).not.toHaveClass('uikit-dt__header-cell--sorted-desc');
});

it('renders null when columnKey is missing', () => {
  render(
    <TableRoot
      markup="native"
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
  expect(document.querySelector('th')).toBeNull();
});

it('Body default-renders rows and Cell shows stringified value', () => {
  render(
    <TableRoot
      markup="div"
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
      markup="div"
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

it('applies getRowSpacing padding on native td, not tr', () => {
  render(
    <TableRoot
      markup="native"
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      getRowSpacing={() => ({ top: 8, bottom: 4 })}
    >
      <TableBody />
    </TableRoot>,
  );
  const td = document.querySelector('td');
  const tr = document.querySelector('tbody tr');
  expect(td).toHaveStyle({ paddingTop: '8px', paddingBottom: '4px' });
  expect((tr as HTMLElement).style.paddingTop).toBe('');
});

it('applies getRowSpacing padding on div row, not cell', () => {
  render(
    <TableRoot
      markup="div"
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      getRowSpacing={() => ({ top: 8, bottom: 4 })}
    >
      <TableBody />
    </TableRoot>,
  );
  const row = document.querySelector('.uikit-dt__row');
  const cell = document.querySelector('.uikit-dt__cell');
  expect(row).toHaveStyle({ paddingTop: '8px', paddingBottom: '4px' });
  expect((cell as HTMLElement).style.paddingTop).toBe('');
});

it('does not leak value onto native td', () => {
  render(
    <TableRoot
      markup="native"
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
    >
      <TableBody />
    </TableRoot>,
  );
  const td = document.querySelector('td');
  expect(td).not.toBeNull();
  expect(td).not.toHaveAttribute('value');
  expect(td).not.toHaveAttribute('row');
  expect(td).not.toHaveAttribute('index');
  expect(td).not.toHaveAttribute('column');
});

it('renders null when Cell columnKey is missing', () => {
  render(
    <TableRoot
      markup="native"
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
  expect(document.querySelector('td')).toBeNull();
});

it('renders null when Row index is missing', () => {
  render(
    <TableRoot
      markup="native"
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
  expect(document.querySelector('tbody tr')).toBeNull();
});

it('virtual Body sizes the container and default-renders rows', () => {
  render(
    <TableRoot
      markup="div"
      data={[{ name: 'bob' }, { name: 'alice' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name', width: 100 }]}
      rowHeight={30}
    >
      <TableBody />
    </TableRoot>,
  );
  const body = document.querySelector('.uikit-dt__body') as HTMLElement;
  expect(body).toHaveStyle({ height: '60px', position: 'relative' });
  expect(screen.getByText('bob')).toBeInTheDocument();
  expect(screen.getByText('alice')).toBeInTheDocument();
  const row = document.querySelector('.uikit-dt__row') as HTMLElement;
  expect(row).toHaveStyle({ position: 'absolute', display: 'flex' });
});

it('merges slotProps.root className and style without dropping virtual chrome', () => {
  render(
    <TableRoot
      markup="div"
      data={[{ name: 'bob' }]}
      columns={[{ key: 'name', accessor: 'name', header: 'Name' }]}
      rowHeight={30}
      slotProps={{ root: { className: 'extra', style: { background: 'red' } } }}
    >
      <span>child</span>
    </TableRoot>,
  );
  const root = document.querySelector('.extra') as HTMLElement;
  expect(root).not.toBeNull();
  expect(root).toHaveClass('uikit-dt', 'extra');
  expect(root).toHaveStyle({
    overflowY: 'auto',
    height: '300px',
    minHeight: '0px',
    background: 'red',
  });
});
