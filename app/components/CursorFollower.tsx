"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ----------------------------------------------------------------------------
 * Custom cursor: an arrow that tracks the pointer, with a label pill trailing
 * behind it on a softer easing so it drifts in rather than snapping.
 *
 * Positions are written straight to the DOM in a rAF loop rather than held in
 * React state — a setState per mousemove would re-render the tree ~120 times a
 * second for a purely visual effect.
 *
 * Desktop only. Anything without a fine pointer keeps the native cursor, and
 * reduced-motion users get no trailing.
 * --------------------------------------------------------------------------*/

/** Label shown when the pointer is over an interactive element. */
const HOVER_LABEL = "click";
const IDLE_LABEL = "hi";

export default function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  // Only on devices with a real pointer.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      setEnabled(mq.matches);
      document.documentElement.classList.toggle("has-custom-cursor", mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // target = true pointer, arrow = light lag, label = heavier lag
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const arrow = { ...target };
    const label = { ...target };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        if (arrowRef.current) arrowRef.current.style.opacity = "1";
        if (labelRef.current) labelRef.current.style.opacity = "1";
      }

      // swap the label when over something clickable
      const el = e.target as HTMLElement | null;
      const interactive = el?.closest("a,button,[role='button'],input,textarea,select");
      if (labelTextRef.current) {
        const next = interactive ? HOVER_LABEL : IDLE_LABEL;
        if (labelTextRef.current.textContent !== next) labelTextRef.current.textContent = next;
      }
    };

    const onLeave = () => {
      visible = false;
      if (arrowRef.current) arrowRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.style.opacity = "0";
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Deliberately slow: 0.18 for the arrow, 0.09 for the label, so the pill
      // visibly drags behind the arrow instead of moving as one unit.
      const arrowEase = reduced ? 1 : 0.18;
      const labelEase = reduced ? 1 : 0.09;

      arrow.x = lerp(arrow.x, target.x, arrowEase);
      arrow.y = lerp(arrow.y, target.y, arrowEase);
      label.x = lerp(label.x, target.x, labelEase);
      label.y = lerp(label.y, target.y, labelEase);

      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate3d(${arrow.x}px, ${arrow.y}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${label.x}px, ${label.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled || typeof document === "undefined") return null;

  return createPortal(
    /* data-nerd-ui so the inspector's hit-test skips these — without it the
       cursor would sit under the pointer and nerd mode would only ever
       report itself. */
    <div data-nerd-ui="" aria-hidden="true">
      {/* label pill — behind the arrow, so it reads as trailing */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9997] opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      >
        <span
          className="absolute left-4 top-3 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium"
          style={{ backgroundColor: "var(--c-primary)", color: "var(--c-background)" }}
        >
          <span ref={labelTextRef}>{IDLE_LABEL}</span>
        </span>
      </div>

      {/* arrow */}
      <div
        ref={arrowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="-translate-x-[2px] -translate-y-[2px]">
          <path
            d="M5.5 3.2 18.6 11.1c.7.4.5 1.5-.3 1.6l-5.6.9c-.3 0-.5.2-.7.4l-2.9 4.9c-.4.7-1.5.5-1.6-.4L5.5 3.2Z"
            fill="var(--c-background)"
            stroke="var(--c-primary)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>,
    document.body,
  );
}
