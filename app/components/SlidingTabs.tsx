"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/* ----------------------------------------------------------------------------
 * Sliding-pill tab switcher (Transitions.dev "Tabs sliding").
 *
 * The pill's width and translateX are measured from the active tab and written
 * inline, so the transition tweens between real measured positions rather than
 * relying on layout animation. Styles live in globals.css under .t-tabs.
 *
 * Used by every tab switcher on the site — the header section nav and the
 * Before/After media toggles — so they share one behaviour.
 * --------------------------------------------------------------------------*/

export type SlidingTab = { id: string; label: string; icon?: React.ReactNode };

export default function SlidingTabs({
  tabs,
  activeId,
  onSelect,
  ariaLabel,
  size = "md",
  className = "",
}: {
  tabs: SlidingTab[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  /** md = header nav (13px), lg = media toggle (13px, roomier padding) */
  size?: "md" | "lg";
  className?: string;
}) {
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /**
   * Write the active tab's geometry onto the pill.
   * `animate: false` suspends the transition, forces a reflow, then restores it
   * — so the pill snaps into place on first paint and on resize instead of
   * sliding in from x=0.
   */
  const syncPill = useCallback(
    (animate: boolean) => {
      const pill = pillRef.current;
      const tab = tabRefs.current[activeId];
      if (!pill || !tab) return;

      if (!animate) pill.style.transition = "none";
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      if (!animate) {
        void pill.offsetWidth; // force reflow so the jump isn't animated
        pill.style.transition = "";
      }
    },
    [activeId],
  );

  // First paint: position without animating.
  useLayoutEffect(() => {
    syncPill(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Active tab changed: animate to the new position.
   *
   * useLayoutEffect, not useEffect: the active tab gains an icon and therefore
   * gets wider in the same commit. Measuring after paint would read the old
   * width for one frame and the pill would visibly jump before settling. */
  useLayoutEffect(() => {
    syncPill(true);
  }, [syncPill]);

  // Resize / font-load can change tab widths — re-snap without animating.
  useEffect(() => {
    const onResize = () => syncPill(false);
    window.addEventListener("resize", onResize);

    // Tab widths shift once the webfonts swap in.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) syncPill(false);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [syncPill]);

  return (
    <div className={`t-tabs ${size === "lg" ? "t-tabs--lg" : ""} ${className}`} role="tablist" aria-label={ariaLabel}>
      <span className="t-tabs-pill" ref={pillRef} aria-hidden="true" />
      {tabs.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            tabRefs.current[t.id] = el;
          }}
          type="button"
          role="tab"
          aria-selected={activeId === t.id}
          onClick={() => onSelect(t.id)}
          className="t-tab"
        >
          {t.icon ?? null}
          {t.label}
        </button>
      ))}
    </div>
  );
}
