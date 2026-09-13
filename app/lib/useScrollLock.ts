import { useEffect } from "react";

/**
 * Holds the page still while an overlay is open.
 *
 * Locks the DOCUMENT element, not the body. Setting `overflow: hidden` on the
 * body makes the body a scroll container, and a scroll container becomes the
 * sticky ancestor for everything inside it — so the sticky header stopped
 * being sticky the instant any overlay opened and snapped back to its static
 * position at the top of the document. Scrolled 400px down, that read as the
 * nav jumping 400px away on open and back on close.
 *
 * html is already the scrolling element here, so making it non-scrollable
 * holds the page without changing which box anything is sticky to.
 *
 * Only overflow-y is assigned, but be aware it does not leave overflow-x
 * alone: CSS will not let `clip` sit next to `hidden`, so the `overflow-x:
 * clip` globals.css puts on html computes to `hidden` for as long as the lock
 * is up. That is harmless — the document's scrollWidth still equals its
 * clientWidth, so there is nothing to scroll sideways to, and the full-bleed
 * section rules stay clipped either way — and it returns to `clip` on release.
 *
 * The padding compensates for the scrollbar the lock removes. It measures 0 on
 * platforms with overlay scrollbars, so it costs nothing there, but without it
 * classic scrollbars would shift the whole page sideways as the overlay opens.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const prevOverflowY = root.style.overflowY;
    const prevPaddingRight = root.style.paddingRight;

    root.style.overflowY = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.style.overflowY = prevOverflowY;
      root.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}
