import {
  cloneElement,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type Ref,
} from 'react';
import { Scroller, type ScrollerHandle } from './Scroller';
import { useElementSize } from '../hooks/use-element-size';
import type { GridColumn, GridHandle, GridProps, GridRow, MergeCellInfo } from '../types/grid';
import { columnsOf, rowsOf } from '../utils/layout';
import { cx } from '../utils/cx';
import { getVisualGrid } from '../utils/visual-grid';
import { mergeOf } from '../utils/merge';

function GridInner<C extends GridColumn, R extends GridRow>({
  columns,
  data,
  columnWidth,
  rowHeight,
  exceed = 100,
  merge,
  onScroll,
  onResize,
  onLimit,
  className,
  style,
  children,
  ref,
}: GridProps<C, R> & { ref?: Ref<GridHandle> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<ScrollerHandle>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const measured = useElementSize(rootRef);

  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  const width = style?.width !== undefined ? Number(style.width) || 0 : measured.width;
  const height = style?.height !== undefined ? Number(style.height) || 0 : measured.height;

  const columnLayout = useMemo(
    () => columnsOf(columnWidth as never, width, data, columns),
    [columnWidth, columns, data, width],
  );

  const rowLayout = useMemo(
    () => rowsOf(rowHeight as never, data, columns),
    [columns, data, rowHeight],
  );

  const mergeController = useMemo(
    () => mergeOf(merge as never, columnLayout as never, rowLayout as never),
    [merge, columnLayout, rowLayout],
  );

  const cells = useMemo(() => {
    if (!width || !height) return [] as ReactElement[];

    mergeController?.format();

    const layers = getVisualGrid({
      top: scroll.top,
      left: scroll.left,
      width,
      height,
      scrollWidth: columnLayout.width,
      scrollHeight: rowLayout.height,
      columns: columnLayout,
      data: rowLayout,
      exceed,
    });

    const rendered: ReactElement[] = [];

    for (const layer of layers) {
      for (const { column, key: columnEntryKey } of layer.columns) {
        for (const { row, key: rowEntryKey } of layer.data) {
          const cellKey = `${columnEntryKey}_${rowEntryKey}`;

          // Business keys for merge deduplication (mirrors uikit)
          const colKey = (column as { key: string }).key;
          const rowKey = (row as { key?: string }).key ?? rowEntryKey;

          const mergeHelper = mergeController
            ? (render: (info: MergeCellInfo) => ReactElement | null) => {
                const decision = mergeController.cell({
                  columnKey: colKey,
                  rowKey,
                  column: column as unknown as {
                    left?: number;
                    width: number;
                    fixed: 'start' | 'end' | 'center';
                  },
                  row: row as unknown as {
                    top?: number;
                    height: number;
                    fixed: 'start' | 'end' | 'center';
                  },
                });

                if (!decision.belongs) return false;

                if (decision.shouldRender) {
                  const merged = render(decision as unknown as MergeCellInfo);
                  if (merged) {
                    rendered.push(
                      cloneElement(merged as ReactElement<{ style?: CSSProperties }>, {
                        key: `merge_${decision.key}`,
                        style: {
                          ...(merged.props as { style?: CSSProperties }).style,
                          width: decision.width,
                          height: decision.height,
                          top: decision.top,
                          left: decision.left,
                        },
                      }),
                    );
                  }
                  // Mark as drawn so subsequent occurrences in this pass are skipped
                  mergeController.done(colKey, rowKey);
                }

                return true;
              }
            : undefined;

          const element = children({
            column: column as C,
            row: row as unknown as R,
            merge: mergeHelper as any,
          });

          if (!element) continue;

          rendered.push(
            cloneElement(element as ReactElement<{ style?: CSSProperties }>, {
              key: cellKey,
              style: {
                ...(element.props as { style?: CSSProperties }).style,
                width: column.width,
                height: row.height,
                top: row.top ?? 0,
                left: column.left ?? 0,
              },
            }),
          );
        }
      }
    }

    return rendered;
  }, [
    children,
    mergeController,
    columnLayout,
    exceed,
    height,
    rowLayout,
    scroll.left,
    scroll.top,
    width,
  ]);

  useLayoutEffect(() => {
    if (!onLimit) return;
    if (!columnLayout.width || !rowLayout.height) return;
    onLimit({ width: columnLayout.width, height: rowLayout.height });
  }, [columnLayout.width, onLimit, rowLayout.height]);

  useLayoutEffect(() => {
    const current = { width, height };
    const last = lastSizeRef.current;
    if (current.width !== last.width || current.height !== last.height) {
      onResize?.(current, last);
      lastSizeRef.current = current;
    }
  }, [height, onResize, width]);

  useImperativeHandle(
    ref,
    () => ({
      scrollTo(left: number, top: number) {
        scrollerRef.current?.scrollTo(left, top);
      },
    }),
    [],
  );

  const rootStyle = {
    ...style,
    ...(style?.width !== undefined ? { width } : null),
    ...(style?.height !== undefined ? { height } : null),
  };

  return (
    <div ref={rootRef} className={cx('uikit-grid', className)} style={rootStyle}>
      <Scroller
        ref={scrollerRef}
        width={width}
        height={height}
        scrollWidth={columnLayout.width}
        scrollHeight={rowLayout.height}
        scrollLeft={scroll.left}
        scrollTop={scroll.top}
        onScrollLeft={(left) => {
          setScroll((prev) => ({ ...prev, left }));
          onScroll?.();
        }}
        onScrollTop={(top) => {
          setScroll((prev) => ({ ...prev, top }));
          onScroll?.();
        }}
      >
        {cells}
      </Scroller>
    </div>
  );
}

export const Grid = GridInner as <C extends GridColumn, R extends GridRow>(
  props: GridProps<C, R> & { ref?: Ref<GridHandle> },
) => ReactElement | null;
