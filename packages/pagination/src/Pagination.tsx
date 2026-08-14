import type { CSSProperties, ReactNode } from 'react';
import { cx } from './cx';

export interface PaginationSlots {
  /** 外层容器,默认 div */
  root?: 'div' | 'nav';
  /** 上一页按钮,默认 button */
  prevButton?: 'button';
  /** 下一页按钮,默认 button */
  nextButton?: 'button';
  /** 页码按钮,默认 button */
  pageButton?: 'button';
}

export interface PaginationProps {
  /** 当前页码(1-based) */
  page: number;
  /** 总页数 */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** 渲染页码列表(含省略号) */
  renderPageList?: (page: number, pageCount: number) => Array<number | 'ellipsis'>;
  /** 页码按钮渲染器(缺省渲染数字) */
  renderPageLabel?: (page: number) => ReactNode;
  /** 上一页/下一页标签,缺省 ‹ › */
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
  /** 上一页/下一页禁用文案,缺省 ‹ › */
  prevAriaLabel?: string;
  nextAriaLabel?: string;
  /** 可替换元素 */
  slots?: PaginationSlots;
  className?: string;
  style?: CSSProperties;
}

/** 默认页码序列: 1 … p 附近 … n(首尾 + 当前页 ±1,省略号折叠) */
export function defaultPageList(page: number, pageCount: number): Array<number | 'ellipsis'> {
  const list: Array<number | 'ellipsis'> = [];
  for (let i = 1; i <= pageCount; i++) {
    const nearEdge = i === 1 || i === pageCount;
    const nearCurrent = i >= page - 1 && i <= page + 1;
    if (nearEdge || nearCurrent) {
      list.push(i);
    } else if (list[list.length - 1] !== 'ellipsis') {
      list.push('ellipsis');
    }
  }
  return list;
}

/**
 * 独立的分页 UI: 上一页 / 页码列表 / 下一页,headless 可定制。
 * 状态由外部 `usePagination` 驱动,不内嵌进任何表格。
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  renderPageList = defaultPageList,
  renderPageLabel = (p) => p,
  prevLabel = '‹',
  nextLabel = '›',
  prevAriaLabel = 'Previous page',
  nextAriaLabel = 'Next page',
  slots,
  className,
  style,
}: PaginationProps) {
  const Root = slots?.root ?? 'div';
  const PrevButton = slots?.prevButton ?? 'button';
  const NextButton = slots?.nextButton ?? 'button';
  const PageButton = slots?.pageButton ?? 'button';
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <Root className={cx('uikit-dt-pagination', className)} style={style} aria-label="Pagination">
      <PrevButton
        type="button"
        aria-label={prevAriaLabel}
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
      >
        {prevLabel}
      </PrevButton>
      {renderPageList(page, pageCount).map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} aria-hidden="true">
            …
          </span>
        ) : (
          <PageButton
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onPageChange(item)}
          >
            {renderPageLabel(item)}
          </PageButton>
        ),
      )}
      <NextButton
        type="button"
        aria-label={nextAriaLabel}
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
      >
        {nextLabel}
      </NextButton>
    </Root>
  );
}
