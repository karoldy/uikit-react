import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { TableHeaderRow } from './TableHeaderRow';

export function TableChrome() {
  return (
    <>
      <TableHeader>
        <TableHeaderRow />
      </TableHeader>
      <TableBody />
    </>
  );
}
