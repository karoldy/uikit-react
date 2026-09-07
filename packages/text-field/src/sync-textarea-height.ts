const LINE_HEIGHT_FALLBACK = 1.4375;

export function syncTextareaHeight(
  el: HTMLTextAreaElement,
  minRows: number,
  maxRows: number | undefined,
) {
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight =
    cs.lineHeight === 'normal' || cs.lineHeight === ''
      ? fontSize * LINE_HEIGHT_FALLBACK
      : parseFloat(cs.lineHeight) || fontSize * LINE_HEIGHT_FALLBACK;
  const padding = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const minHeight = minRows * lineHeight + padding;
  const maxHeight = maxRows === undefined ? undefined : maxRows * lineHeight + padding;

  el.style.height = '0px';
  const contentHeight = el.scrollHeight;
  let next = Math.max(contentHeight, minHeight);
  if (maxHeight !== undefined) {
    el.style.overflowY = contentHeight > maxHeight + 1 ? 'auto' : 'hidden';
    next = Math.min(next, maxHeight);
  } else {
    el.style.overflowY = 'hidden';
  }
  el.style.height = `${next}px`;
}
