import type { CSSProperties } from 'react';
import React from 'react';
import { cx } from '../utils/cx';
import type { CellProps } from '../types/grid';
import type { SortDirection, SortState } from '@uikit-react/hooks';
import { Cell } from './Cell';

export interface HCellProps extends Omit<CellProps, 'children'> {
  /** columnKey */
  name: string;
  /** 当前排序状态（来自 @uikit-react/hooks 的 useSorting） */
  sort?: SortState;
  /**
   * 为 true：单击默认走多列模式（Shift+click 也会追加/循环该列）
   * 与 useSorting 里的 multiSort 语义一致。
   */
  multiple?: boolean;
  /** 视觉/交互是否可排序 */
  sortable?: boolean;
  /** header 文本/节点 */
  children?: React.ReactNode;
  /** 点击后的下一状态（仅 HCell 负责算 next，不依赖 data） */
  onSortChange?: (next: SortState) => void;
}

function getDirection(sort: SortState | undefined, columnKey: string): SortDirection | undefined {
  return sort?.find((item) => item.columnKey === columnKey)?.direction;
}

function nextSortState(current: SortState, columnKey: string, multi: boolean): SortState {
  const index = current.findIndex((item) => item.columnKey === columnKey);

  if (multi) {
    if (index === -1) return [...current, { columnKey, direction: 'asc' }];
    if (current[index].direction === 'asc') {
      return current.map((item, i) => (i === index ? { columnKey, direction: 'desc' } : item));
    }
    return current.filter((_, i) => i !== index);
  }

  const only = current.length === 1 && current[0].columnKey === columnKey;
  if (!only) return [{ columnKey, direction: 'asc' }];
  if (current[0]?.direction === 'asc') return [{ columnKey, direction: 'desc' }];
  return [];
}

export function HCell({
  name,
  sort,
  multiple = false,
  sortable = true,
  onSortChange,
  align,
  border,
  odd,
  even,
  className,
  children,
  style,
  ...rest
}: HCellProps): React.ReactElement {
  const direction = getDirection(sort, name);

  const classes = cx(
    className,
    'uikit-grid__hcell',
    direction === 'asc' && 'uikit-grid__cell--sorted-asc',
    direction === 'desc' && 'uikit-grid__cell--sorted-desc',
  );

  return (
    <Cell
      {...rest}
      className={classes}
      align={align}
      border={border}
      odd={odd}
      even={even}
      style={style as CSSProperties}
    >
      {sortable ? (
        <button
          type="button"
          className="uikit-grid__hcell-button"
          onClick={(event) => {
            const multi = multiple || event.shiftKey;
            const next = nextSortState(sort ?? [], name, multi);
            onSortChange?.(next);
          }}
        >
          {children}
        </button>
      ) : (
        children
      )}
    </Cell>
  );
}
