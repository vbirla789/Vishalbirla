"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { playHover, playSelect } from "../lib/sound";

/* ----------------------------------------------------------------------------
 * Nerd mode — an inspect overlay for the site itself.
 *
 * Toggle (bottom right, or press "n") draws a blueprint grid, outlines the
 * page's structural blocks, and follows the pointer with a measurement box:
 * typography chips above the element, and a name / format / dimensions card
 * beside it.
 *
 * Everything renders through a portal into <body> and is pointer-events:none,
 * so the page underneath stays fully usable while the overlay is on.
 *
 * Split into a provider and a toggle so the button can live in the header
 * while the overlay stays mounted at the layout level: the provider wraps
 * children, so anything in the tree can reach the state through context.
 * --------------------------------------------------------------------------*/

type NerdCtx = { on: boolean; toggle: () => void };
const Ctx = createContext<NerdCtx | null>(null);

/** Button for the header. Must sit inside NerdModeProvider. */
export function NerdModeToggle() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const { on, toggle } = ctx;

  return (
    <button
      type="button"
      onClick={() => {
        playSelect();
        toggle();
      }}
      onMouseEnter={playHover}
      aria-pressed={on}
      aria-label={on ? "Turn off AI glasses" : "Turn on AI glasses (n)"}
      /* Hidden on phones, matching the overlay: the inspector needs a pointer
         and the measurement chips have nowhere to sit on a 375px screen. */
      className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium leading-none outline-none transition-colors duration-200 sm:flex"
      style={{
        backgroundColor: on ? "var(--c-accent)" : "transparent",
        color: on ? "#fff" : "var(--c-tab-active)",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
        <circle cx="6" cy="14" r="3.4" />
        <circle cx="18" cy="14" r="3.4" />
        <path d="M9.4 14c.6-1 1.6-1 2.6-1s2 0 2.6 1" strokeLinecap="round" />
        <path d="M2.6 12.4 4 9.2M21.4 12.4 20 9.2" strokeLinecap="round" />
      </svg>
      AI glasses
    </button>
  );
}

type Info = {
  rect: { top: number; left: number; width: number; height: number };
  name: string;
  format: string;
  chips: string[];
};

/** Ignore our own overlay, and anything injected by dev tooling. */
const IGNORE = "[data-nerd-ui], #__next-build-watcher, nextjs-portal, [data-retune]";

/** A readable name for the hovered node, best source first. */
function nameFor(el: HTMLElement): string {
  return (
    el.dataset.nerd ||
    el.id ||
    el.getAttribute("aria-label") ||
    (el.tagName === "IMG" ? (el as HTMLImageElement).alt || "image" : "") ||
    el.tagName.toLowerCase()
  );
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function chipsFor(el: HTMLElement, cs: CSSStyleDeclaration, rect: DOMRect): string[] {
  const chips: string[] = [];
  const hasText = (el.textContent || "").trim().length > 0 && el.children.length === 0;

  if (hasText) {
    const px = parseFloat(cs.fontSize);
    chips.push(`Aa ${round(px / 16)}rem`);

    const lh = cs.lineHeight === "normal" ? 1.2 * px : parseFloat(cs.lineHeight);
    chips.push(`↕ ${round(lh / px)}`);

    if (cs.letterSpacing && cs.letterSpacing !== "normal") {
      chips.push(`↔ ${round(parseFloat(cs.letterSpacing) / px)}em`);
    }
    chips.push(`A ${cs.color.replace(/\s+/g, "")}`);
  }

  chips.push(`W ${Math.round(rect.width)}px`);
  chips.push(`H ${Math.round(rect.height)}px`);
  return chips;
}

export default function NerdModeProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [meta, setMeta] = useState({ vw: 0, vh: 0, scroll: 0 });
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef(0);

  /* The portal always has content (the toggle), so returning null on the
     server while the client's first render produced a portal put different
     node types at the same tree position and hydration failed. Rendering
     nothing until after mount makes the first client pass match the server. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      document.documentElement.classList.toggle("nerd", next);
      if (!next) setInfo(null);
      return next;
    });
  }, []);

  // keyboard shortcut, skipped while typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === "n" || e.key === "N") {
        playSelect();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // follow the pointer while enabled
  useEffect(() => {
    if (!on) return;

    const measure = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!el || el.closest(IGNORE) || el === document.body || el === document.documentElement) {
        setInfo(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) {
        setInfo(null);
        return;
      }
      const cs = getComputedStyle(el);
      setInfo({
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        name: nameFor(el),
        format: `${el.tagName.toLowerCase()} / ${cs.display}`,
        chips: chipsFor(el, cs, rect),
      });
    };

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => measure(e.clientX, e.clientY));
    };
    const onScroll = () =>
      setMeta((m) => ({
        ...m,
        scroll: Math.round(
          (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100,
        ),
      }));
    const onResize = () => setMeta((m) => ({ ...m, vw: window.innerWidth, vh: window.innerHeight }));

    onResize();
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [on]);

  useEffect(() => () => document.documentElement.classList.remove("nerd"), []);

  const value = { on, toggle };

  // Overlay waits for mount so the first client render matches the server;
  // children must render either way or the whole page would blank on SSR.
  const overlayReady = mounted && typeof document !== "undefined";

  /* Everything below touches document/window, so it must stay inside the
     guard. Building the portal unconditionally crashed the production
     prerender with "document is not defined" — dev hid it, `next build`
     did not. */
  let overlay: React.ReactNode = null;
  if (overlayReady) {
    // card flips to the left edge when the element sits near the right gutter
    const cardLeft = info ? Math.min(info.rect.left, window.innerWidth - 240) : 0;
    const cardTop = info
      ? Math.min(info.rect.top + info.rect.height + 10, window.innerHeight - 130)
      : 0;

    overlay = createPortal(
    /* Hidden on phones: the inspector is a pointer tool — it needs hover to
       target elements, and the measurement chips and card have nowhere to go
       on a 375px screen. display:none on this wrapper takes the toggle, the
       overlay and the status bar with it. */
    <div data-nerd-ui="" className="hidden sm:block">
      {on ? (
        <>
          {/* highlight + chips + card, all inert */}
          <div className="pointer-events-none fixed inset-0 z-[9990]">
            {info ? (
              <>
                <div
                  className="absolute"
                  style={{
                    top: info.rect.top,
                    left: info.rect.left,
                    width: info.rect.width,
                    height: info.rect.height,
                    outline: "1px dashed var(--c-accent)",
                    outlineOffset: 2,
                    background: "color-mix(in srgb, var(--c-accent) 7%, transparent)",
                  }}
                />

                {/* typography chips above the element */}
                <div
                  className="absolute flex flex-wrap gap-1"
                  style={{
                    top: Math.max(4, info.rect.top - 26),
                    left: info.rect.left,
                    maxWidth: "min(90vw, 640px)",
                  }}
                >
                  {info.chips.map((c) => (
                    <span
                      key={c}
                      className="whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] leading-none"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--c-accent) 16%, var(--c-background))",
                        color: "var(--c-accent)",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* detail card */}
                <div
                  className="absolute w-[228px] rounded-xl p-3"
                  style={{
                    top: cardTop,
                    left: cardLeft,
                    backgroundColor: "var(--c-surface)",
                    boxShadow: `inset 0 0 0 1px var(--c-line), 0 18px 40px -14px rgba(0,0,0,.6)`,
                  }}
                >
                  {[
                    ["NAME", info.name],
                    ["FORMAT", info.format],
                    ["DIMENSIONS", `${Math.round(info.rect.width)} × ${Math.round(info.rect.height)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="mb-2 last:mb-0">
                      <div className="font-mono text-[9px] tracking-wider" style={{ color: "var(--c-accent)" }}>
                        {k}
                      </div>
                      <div className="truncate font-mono text-[12px]" style={{ color: "var(--c-primary)" }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* status bar */}
          <div
            data-nerd-ui=""
            /* bottom-centre, not a corner: both corners are taken in dev by
               Next's indicator and the retune widget */
            className="pointer-events-none fixed bottom-6 left-1/2 z-[9995] -translate-x-1/2 rounded-lg px-3 py-2 font-mono text-[11px]"
            style={{
              backgroundColor: "var(--c-surface)",
              color: "var(--c-secondary)",
              boxShadow: `inset 0 0 0 1px var(--c-line)`,
            }}
          >
            vp {meta.vw}×{meta.vh} · scroll {meta.scroll}% · theme{" "}
            {typeof document !== "undefined" && document.documentElement.classList.contains("dark")
              ? "dark"
              : "light"}
          </div>
        </>
      ) : null}
    </div>,
    document.body,
    );
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      {overlay}
    </Ctx.Provider>
  );
}
