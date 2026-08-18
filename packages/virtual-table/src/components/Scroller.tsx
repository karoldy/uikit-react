import {
  useCallback,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type WheelEvent,
  type Ref,
} from 'react';
import { clamp, cx, scrollStep } from '../utils/cx';

export interface ScrollerHandle {
  scrollTo: (left: number, top: number) => void;
}

export interface ScrollerProps {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  onScrollLeft: (left: number) => void;
  onScrollTop: (top: number) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Scroller({
  width,
  height,
  scrollWidth,
  scrollHeight,
  scrollLeft,
  scrollTop,
  onScrollLeft,
  onScrollTop,
  className,
  style,
  children,
  ref,
}: ScrollerProps & { ref?: Ref<ScrollerHandle> }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const maxLeft = Math.max(0, scrollWidth - width);
  const maxTop = Math.max(0, scrollHeight - height);
  const hasHorizontal = width < scrollWidth;
  const hasVertical = height < scrollHeight;

  const scrollTo = useCallback(
    (left: number, top: number) => {
      onScrollLeft(clamp(left, 0, maxLeft));
      onScrollTop(clamp(top, 0, maxTop));
    },
    [maxLeft, maxTop, onScrollLeft, onScrollTop],
  );

  useImperativeHandle(ref, () => ({ scrollTo }), [scrollTo]);

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!hasHorizontal && !hasVertical) return;

    event.preventDefault();
    event.stopPropagation();

    if (hasVertical) {
      onScrollTop(clamp(scrollTop + scrollStep(event.deltaY), 0, maxTop));
      onScrollLeft(clamp(scrollLeft + scrollStep(event.deltaX), 0, maxLeft));
      return;
    }

    onScrollLeft(clamp(scrollLeft + scrollStep(event.deltaX || event.deltaY), 0, maxLeft));
  };

  return (
    <div
      ref={rootRef}
      className={cx('uikit-grid__scroller', className)}
      style={{ width, height, ...style }}
      onWheel={onWheel}
      data-testid="grid-scroller"
    >
      <div className="uikit-grid__viewport" style={{ width, height, position: 'relative' }}>
        {children}
      </div>
      {hasVertical ? (
        <Scrollbar
          horizontal={false}
          client={height}
          total={scrollHeight}
          value={scrollTop}
          onScroll={(next) => onScrollTop(clamp(next, 0, maxTop))}
        />
      ) : null}
      {hasHorizontal ? (
        <Scrollbar
          horizontal
          client={width}
          total={scrollWidth}
          value={scrollLeft}
          onScroll={(next) => onScrollLeft(clamp(next, 0, maxLeft))}
        />
      ) : null}
    </div>
  );
}

interface ScrollbarProps {
  horizontal: boolean;
  client: number;
  total: number;
  value: number;
  onScroll: (value: number) => void;
}

function Scrollbar({ horizontal, client, total, value, onScroll }: ScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbSize = Math.max(24, (client / total) * client);
  const maxValue = Math.max(0, total - client);
  const travel = Math.max(0, client - thumbSize);
  const thumbOffset = maxValue === 0 ? 0 : (value / maxValue) * travel;

  const onTrackClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || maxValue === 0) return;

    const rect = track.getBoundingClientRect();
    const clickPos = horizontal ? event.clientX - rect.left : event.clientY - rect.top;
    const next = (clickPos / client) * maxValue;
    onScroll(clamp(next, 0, maxValue));
  };

  return (
    <div
      ref={trackRef}
      className={cx('uikit-grid__scrollbar', horizontal && 'uikit-grid__scrollbar--horizontal')}
      onClick={onTrackClick}
      data-testid={horizontal ? 'grid-scrollbar-x' : 'grid-scrollbar-y'}
    >
      <div
        className="uikit-grid__scrollbar-thumb"
        style={
          horizontal
            ? { width: thumbSize, transform: `translateX(${thumbOffset}px)` }
            : { height: thumbSize, transform: `translateY(${thumbOffset}px)` }
        }
      />
    </div>
  );
}
