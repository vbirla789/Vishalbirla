"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { colors, t, type } from "../theme";
import { releaseIntro } from "../lib/introGate";
import { playSuccess } from "../lib/sound";
import { useScrollLock } from "../lib/useScrollLock";

/* ----------------------------------------------------------------------------
 * Intro — a "hold to enter" gate in the bricelab.dev style, drawn on the
 * portfolio's own frame.
 *
 * It opens straight on its one state: a hairline frame on the page's column
 * lines with an orange square on each corner, a dot-lattice cube in it and
 * "Hold to enter" under that. There is no loading phase — no counter, no bar — on purpose: the
 * page is static and ready, so a fake progress gauge would only be a delay.
 *
 * The frame IS the page's first frame, pulled in. On the page, the column
 * lines, the header hairline and the Work section's rule box the intro, with
 * an orange square on each of the four crossings. The loader draws that box
 * small and centred on the screen; when the hold fills the cube, the top edge
 * rises onto the header hairline and the bottom edge drops onto the first
 * rule below it (off the screen if none is in view), its squares landing on
 * the page's squares. The rest of those lines then draw out of the corners —
 * the header hairline and the rule across the screen, the columns down it —
 * and the content materialises on the finished structure, after the
 * reference's wireframe-then-surface build. Nothing jumps at the hand-over because the loader's
 * frame and the page's are, by then, the same lines.
 *
 * The page is hidden while this is up (html.intro-playing) but keeps its
 * layout, which is what lets the frame be measured onto it. The dither
 * backdrop is outside #page-shell, so it stays visible behind the frame.
 *
 * Ground rules carried over from the previous loader:
 * - Plays on every full page load, never on client-side navigation back home.
 * - Escape skips straight in. Reduced motion gets no movement, and a press
 *   enters immediately instead of needing a hold.
 * - Portalled to <body> — #page-shell is a stacking context (see layout.tsx).
 * --------------------------------------------------------------------------*/

/* ---- easing -------------------------------------------------------------- */
type Ease = (t: number) => number;
const outQuart: Ease = (t) => 1 - (1 - t) ** 4;
const inOutQuad: Ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const inOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* ---- timing (ms) ---------------------------------------------------------- */
const T = {
  appear: 600, // veil lifting off the dither, cube + prompt fading up
  hold: 900, // a full press, empty → full
  stall: 120, // pause before a released cube starts draining
  letGo: 1200, // draining from full
  letGoMin: 450,
  /* enter, in the reference's three beats — charge, wireframe, materialise */
  charge: 160, // the full cube flares
  dimAt: 120,
  dim: 650, // cube + prompt dim and drift up out of focus
  openAt: 200,
  open: 1100, // top edge rising, bottom edge dropping, onto the page's lines
  drawAt: 1050, // the page's lines draw out from the corners as the edges land
  draw: 750,
  revealAt: 1350, // page content materialises on the finished structure
  handAt: 2000, // landed frame hands over to the identical page lines
  hand: 250,
};

/* Default-frame sizing: the frame hugs the cube + prompt with PAD_Y above
   and below, and sits centred on the screen. An edge only lands on a page
   line that is at least MIN_TRAVEL away, so the open always reads as the top
   edge rising and the bottom edge dropping, never one creeping backwards. */
const PAD_Y = 67;
const MIN_TRAVEL = 16;
/* Off-screen distance for an edge with no page line to land on. */
const OFFSCREEN = 24;
/* Cube → prompt spacing, and the prompt's line box. */
const PROMPT_GAP = 32;
const PROMPT_LINE = 20;
const GROUP_H = 134 + PROMPT_GAP + PROMPT_LINE; // cube canvas + gap + prompt

const PROMPT_TEXT = "Hold to enter the portfolio";

/* ---- tiny timeline -------------------------------------------------------- */
type Track = { at: number; dur: number; run: (k: number) => void };
function playTimeline(tracks: Track[], onDone?: () => void) {
  const t0 = performance.now();
  const done = new Set<Track>();
  let raf = 0;
  const tick = (now: number) => {
    const t = now - t0;
    for (const tr of tracks) {
      if (done.has(tr) || t < tr.at) continue;
      const k = tr.dur <= 0 ? 1 : Math.min(1, (t - tr.at) / tr.dur);
      tr.run(k);
      if (k >= 1) done.add(tr);
    }
    if (done.size < tracks.length) raf = requestAnimationFrame(tick);
    else onDone?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/* ---- frame geometry ------------------------------------------------------ */
type Rect = { left: number; right: number; top: number; bottom: number };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Stage padding: the reference's p-6 / md:p-4. */
const stagePad = (vw: number) => (vw >= 768 ? 16 : 24);

/** The side edges: the page's column lines, or the stage edge where the page
 *  has none (below 888px — see page.tsx). */
function columns(vw: number) {
  const pad = stagePad(vw);
  const main = document.querySelector("#page-shell main")?.getBoundingClientRect();
  if (main && vw >= 888) return { left: main.left, right: main.right - 1 };
  return { left: pad, right: vw - pad - 1 };
}

/** The default frame: hugging the cube + prompt, centred on the screen. */
function restFrame(vw: number, vh: number): Rect {
  const h = Math.min(GROUP_H + PAD_Y * 2, vh - stagePad(vw) * 2);
  return { ...columns(vw), top: vh / 2 - h / 2, bottom: vh / 2 + h / 2 };
}

/** Where the frame opens to — the page's own lines, measured live. The top
 *  edge rises to the header hairline; the bottom edge drops to the first
 *  section rule below it (the one above Work on most screens). With no line
 *  to land on in that direction, the edge carries on off the screen. */
function pageFrame(rest: Rect, vw: number, vh: number): Rect {
  const header = document.querySelector("#page-shell header")?.getBoundingClientRect();
  /* the hairline is only drawn from sm up */
  const headerY = header && vw >= 640 ? header.bottom - 1 : NaN;
  const top = headerY < rest.top - MIN_TRAVEL ? headerY : -OFFSCREEN;
  const rules = Array.from(document.querySelectorAll("#page-shell main div.h-px.w-screen"))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.height > 0) // not drawn on phones
    .map((r) => Math.round(r.top));
  const below = rules.find((y) => y > rest.bottom + MIN_TRAVEL && y < vh - 8);
  return { ...rest, top, bottom: below ?? vh + OFFSCREEN };
}

/* ---- dot-lattice cube ----------------------------------------------------- */
const CUBE_W = 102;
const CUBE_H = 134;
const STEPS = 9; // lattice points along each horizontal edge
const H_STEPS = 12; // along the vertical
const EDGE = 58.5; // projected horizontal edge length, px
const TALL = 75; // projected height, px
const DOT = 1.5;
const REST = 0.05;
const ACTIVE = 0.8;

type Dot = { x: number; y: number; h: number; edge: boolean };
function buildLattice(): Dot[] {
  const dots: Dot[] = [];
  const cos = Math.cos(Math.PI / 6);
  const sin = Math.sin(Math.PI / 6);
  for (let i = 0; i < STEPS; i++)
    for (let k = 0; k < STEPS; k++)
      for (let j = 0; j < H_STEPS; j++) {
        const u = i / (STEPS - 1);
        const w = k / (STEPS - 1);
        const h = j / (H_STEPS - 1);
        const onX = i === 0 || i === STEPS - 1;
        const onZ = k === 0 || k === STEPS - 1;
        const onY = j === 0 || j === H_STEPS - 1;
        dots.push({
          x: CUBE_W / 2 + (u - w) * EDGE * cos,
          y: TALL + (u + w) * EDGE * sin - h * TALL,
          h,
          edge: Number(onX) + Number(onZ) + Number(onY) >= 2,
        });
      }
  return dots;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* Has the intro run in THIS document? Module scope, so it resets on every full
   page load but survives client-side navigation (sessionStorage was dropped
   because a stuck key hid the intro for the life of the tab). */
let playedThisLoad = false;

type Phase = "ready" | "leaving";

export default function IntroLoader() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");

  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<(HTMLElement | null)[]>([]); // top, bottom, left, right
  const cornersRef = useRef<(HTMLElement | null)[]>([]); // tl, tr, bl, br
  /* The page lines that carry on past the frame, drawn out on enter:
     header hairline left/right, Work rule left/right, columns below. */
  const extRef = useRef<(HTMLElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holdRef = useRef<HTMLButtonElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  /* Live animation state the canvas loop and resize handler read. */
  const live = useRef({
    open: 0, // 0 on the page's structure → 1 pushed out past the edges
    shownAt: 0, // when the overlay appeared (perf clock), for the cube fade-up
    fill: 0, // hold progress 0–1
    charge: 0, // the full cube's flare, 0–1
    draw: 0, // the page lines drawing out from the frame's corners, 0–1
    reduced: false,
  });

  /* ---- mount gate ---- */
  useEffect(() => {
    const root = document.documentElement;
    if (playedThisLoad) {
      root.classList.remove("intro-pending");
      releaseIntro();
      return;
    }
    live.current.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* A mount flag on purpose: the overlay is a portal into <body>, which the
       server can't render, so it has to appear after hydration. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, []);

  /* Once the overlay is painted, swap the pre-hydration cover for the class
     that only hides the page — the dither has to show through. */
  useLayoutEffect(() => {
    if (!show) return;
    const root = document.documentElement;
    root.classList.add("intro-playing");
    root.classList.remove("intro-pending");
  }, [show]);

  /* ---- geometry ---- */
  const layoutFrame = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const p = live.current.open;
    const a = restFrame(vw, vh);
    const b = pageFrame(a, vw, vh);
    const cur = {
      left: lerp(a.left, b.left, p),
      right: lerp(a.right, b.right, p),
      top: lerp(a.top, b.top, p),
      bottom: lerp(a.bottom, b.bottom, p),
    };
    const [top, bottom, left, right] = rulesRef.current;
    const hRule = (el: HTMLElement | null, y: number) => {
      if (!el) return;
      el.style.transform = `translate3d(${cur.left}px, ${Math.round(y)}px, 0)`;
      el.style.width = `${cur.right - cur.left + 1}px`;
    };
    const vRule = (el: HTMLElement | null, x: number) => {
      if (!el) return;
      el.style.transform = `translate3d(${Math.round(x)}px, ${cur.top}px, 0)`;
      el.style.height = `${cur.bottom - cur.top + 1}px`;
    };
    hRule(top, cur.top);
    hRule(bottom, cur.bottom);
    vRule(left, cur.left);
    vRule(right, cur.right);
    /* 5px squares centred on the 1px lines, like the header's own squares */
    const pts = [
      [cur.left, cur.top],
      [cur.right, cur.top],
      [cur.left, cur.bottom],
      [cur.right, cur.bottom],
    ];
    cornersRef.current.forEach((el, i) => {
      if (!el) return;
      const [x, y] = pts[i];
      el.style.transform = `translate3d(${Math.round(x) - 2}px, ${Math.round(y) - 2}px, 0)`;
    });

    /* Extensions: the rest of each page line, growing out of the corners.
       Only where the page actually draws that structure (888px+). */
    const d = vw >= 888 ? live.current.draw : 0;
    const [tl, tr, bl, br, cl, cr] = extRef.current;
    const hExt = (el: HTMLElement | null, y: number, x0: number, x1: number, fromRight: boolean) => {
      if (!el) return;
      el.style.width = `${Math.max(0, x1 - x0)}px`;
      el.style.transformOrigin = fromRight ? "100% 50%" : "0% 50%";
      el.style.transform = `translate3d(${x0}px, ${Math.round(y)}px, 0) scaleX(${d})`;
    };
    const vExt = (el: HTMLElement | null, x: number, y0: number) => {
      if (!el) return;
      el.style.height = `${Math.max(0, vh - y0)}px`;
      el.style.transform = `translate3d(${Math.round(x)}px, ${y0}px, 0) scaleY(${d})`;
    };
    hExt(tl, cur.top, 0, cur.left, true);
    hExt(tr, cur.top, cur.right + 1, vw, false);
    hExt(bl, cur.bottom, 0, cur.left, true);
    hExt(br, cur.bottom, cur.right + 1, vw, false);
    vExt(cl, cur.left, cur.bottom + 1);
    vExt(cr, cur.right, cur.bottom + 1);

    /* Cube + prompt as one group, centred in the default frame; the cube
       scales down when the frame is short so the pair always fits. */
    const room = a.bottom - a.top;
    const fit = Math.min(1, Math.max(0.5, (room - PAD_Y * 2 - PROMPT_GAP - PROMPT_LINE) / CUBE_H));
    const cubeH = CUBE_H * fit;
    const groupTop = (a.top + a.bottom) / 2 - (cubeH + PROMPT_GAP + PROMPT_LINE) / 2;
    if (holdRef.current) holdRef.current.style.scale = String(fit);
    if (cubeRef.current) cubeRef.current.style.top = `${groupTop + cubeH / 2}px`;
    if (promptRef.current) promptRef.current.style.top = `${groupTop + cubeH + PROMPT_GAP}px`;
  }, []);

  useLayoutEffect(() => {
    if (!show) return;
    live.current.shownAt = performance.now();
    layoutFrame();
    /* Webfonts landing can move the Work rule a few px — measure again. */
    document.fonts?.ready.then(layoutFrame);
    window.addEventListener("resize", layoutFrame);
    return () => window.removeEventListener("resize", layoutFrame);
  }, [show, layoutFrame]);

  /* ---- appear: the veil lifts off the dither as the cube + prompt fade up ---- */
  useEffect(() => {
    if (!show) return;
    const veil = veilRef.current;
    const content = contentRef.current;
    if (live.current.reduced) {
      if (veil) veil.style.opacity = "0";
      if (content) content.style.opacity = "1";
      return;
    }
    return playTimeline([
      {
        at: 0,
        dur: T.appear,
        run: (k) => {
          const v = outQuart(k);
          if (veil) veil.style.opacity = String(1 - v);
          if (content) content.style.opacity = String(v);
        },
      },
    ]);
  }, [show]);

  /* ---- cube renderer ---- */
  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = CUBE_W * dpr;
    canvas.height = CUBE_H * dpr;
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--c-primary").trim() || "#fafafa";
    const dots = buildLattice();
    let raf = 0;
    const draw = (now: number) => {
      const L = live.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CUBE_W, CUBE_H);
      ctx.fillStyle = ink;
      /* The edges light in a wave that climbs from the floor as it appears,
         then hold lit with a slow downward shimmer. */
      const t = L.reduced ? 1e9 : now - L.shownAt;
      const front = t * 0.0012 - 0.1;
      const settled = L.reduced ? 1 : clamp01((t - 500) / 600);
      for (const d of dots) {
        let a = REST;
        let s = 1;
        if (d.edge) {
          if (t < 1600) a = Math.max(a, 0.85 * Math.exp(-(((d.h - front) / 0.1) ** 2)));
          const shimmer = 0.12 * Math.sin(2 * Math.PI * (now / 2200 + d.h));
          a = Math.max(a, settled * (0.68 + shimmer));
        }
        /* the full cube flares as the hold completes */
        if (L.charge > 0) {
          a = Math.max(a, L.charge);
          s = Math.max(s, 1 + 0.6 * L.charge);
        }
        /* hold: the lattice fills from the floor up */
        if (L.fill > 0) {
          const v = clamp01((L.fill * 1.1 - d.h) / 0.08);
          if (v > 0) {
            a = Math.max(a, ACTIVE * v);
            s = 1 + 0.5 * v;
          }
        }
        const size = DOT * s;
        ctx.globalAlpha = a;
        ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  /* ---- enter ---- */
  const finish = useCallback(() => {
    playedThisLoad = true;
    document.documentElement.classList.remove("intro-pending", "intro-playing");
    setShow(false);
  }, []);

  const enter = useCallback(() => {
    if (phase === "leaving") return;
    setPhase("leaving");
    playSuccess();
    const reveal = () => {
      /* The page's structure is identical to the frame by now, so it can
         appear underneath without a seam; its content materialises in. */
      document.documentElement.classList.remove("intro-playing");
      releaseIntro();
    };
    if (live.current.reduced) {
      reveal();
      playTimeline(
        [{ at: 0, dur: 200, run: (k) => rootRef.current && (rootRef.current.style.opacity = String(1 - k)) }],
        finish,
      );
      return;
    }
    const L = live.current;
    /* Three overlapping beats, after the reference: the full cube flares and
       dims out of focus; the frame glides open onto the page's lines and
       those lines draw out to their full length; then the content
       materialises on the finished structure. Every beat starts before the
       last one ends, so there is never a still frame between them. */
    playTimeline(
      [
        { at: 0, dur: T.charge, run: (k) => (L.charge = k) },
        {
          at: T.dimAt,
          dur: T.dim,
          run: (k) => {
            const v = outQuart(k);
            L.charge = 1 - v;
            const el = contentRef.current;
            if (!el) return;
            el.style.opacity = String(1 - v);
            el.style.filter = `blur(${v * 6}px)`;
            el.style.transform = `translateY(${-10 * v}px) scale(${1 + 0.04 * v})`;
          },
        },
        {
          at: T.openAt,
          dur: T.open,
          run: (k) => {
            L.open = inOutCubic(k);
            layoutFrame();
          },
        },
        {
          at: T.drawAt,
          dur: T.draw,
          run: (k) => {
            L.draw = outQuart(k);
            layoutFrame();
          },
        },
        { at: T.revealAt, dur: 0, run: reveal },
        {
          at: T.handAt,
          dur: T.hand,
          run: (k) => frameRef.current && (frameRef.current.style.opacity = String(1 - k)),
        },
      ],
      finish,
    );
  }, [phase, finish, layoutFrame]);

  /* ---- hold to enter ---- */
  const fillTween = useRef<() => void>(() => {});
  const tweenFill = (to: number, dur: number, ease: Ease, delay = 0, done?: () => void) => {
    fillTween.current();
    const from = live.current.fill;
    fillTween.current = playTimeline(
      [
        {
          at: delay,
          dur,
          run: (k) => {
            live.current.fill = from + (to - from) * ease(k);
          },
        },
      ],
      done,
    );
  };
  const ready = phase === "ready";
  const press = () => {
    if (!ready) return;
    if (live.current.reduced) return enter();
    tweenFill(1, T.hold * (1 - live.current.fill), (t) => t, 0, enter);
  };
  const release = () => {
    if (!ready) return;
    const f0 = live.current.fill;
    if (f0 >= 1) return;
    if (f0 === 0) return fillTween.current();
    tweenFill(0, Math.max(T.letGoMin, T.letGo * f0), inOutQuad, T.stall);
  };
  useEffect(() => () => fillTween.current(), []);

  /* Escape skips straight in. */
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, enter]);

  useScrollLock(show);

  if (typeof document === "undefined" || !show) return null;

  const isKey = (e: React.KeyboardEvent) => e.key === " " || e.key === "Enter";

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal
      aria-label="Hold to enter the portfolio, or press Escape"
      className={`fixed inset-0 z-[10020] select-none overflow-hidden ${
        ready ? "cursor-pointer" : "pointer-events-none"
      }`}
      style={{ color: colors.primary, touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        press();
      }}
      onPointerUp={(e) => e.isPrimary && release()}
      onPointerCancel={(e) => e.isPrimary && release()}
    >
      {/* veil: matches the pre-hydration cover, then lifts off the dither */}
      <div ref={veilRef} aria-hidden className="absolute inset-0" style={{ backgroundColor: colors.background }} />

      {/* frame rules + orange corner squares, positioned by layoutFrame() */}
      <div ref={frameRef} aria-hidden className="absolute inset-0">
        {[0, 1].map((i) => (
          <i
            key={`h${i}`}
            ref={(el) => {
              rulesRef.current[i] = el;
            }}
            className="absolute left-0 top-0 h-px"
            style={{ backgroundColor: colors.line }}
          />
        ))}
        {[2, 3].map((i) => (
          <i
            key={`v${i}`}
            ref={(el) => {
              rulesRef.current[i] = el;
            }}
            className="absolute left-0 top-0 w-px"
            style={{ backgroundColor: colors.line }}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <i
            key={`e${i}`}
            ref={(el) => {
              extRef.current[i] = el;
            }}
            className="absolute left-0 top-0 h-px"
            style={{ backgroundColor: colors.line, transform: "scaleX(0)" }}
          />
        ))}
        {[4, 5].map((i) => (
          <i
            key={`e${i}`}
            ref={(el) => {
              extRef.current[i] = el;
            }}
            className="absolute left-0 top-0 w-px origin-top"
            style={{ backgroundColor: colors.line, transform: "scaleY(0)" }}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <i
            key={`c${i}`}
            ref={(el) => {
              cornersRef.current[i] = el;
            }}
            className="absolute left-0 top-0 h-[5px] w-[5px]"
            style={{ backgroundColor: colors.accent }}
          />
        ))}
      </div>

      <div ref={contentRef} style={{ opacity: 0 }}>
        {/* the cube, centred in the frame (top set by layoutFrame) */}
        <div ref={cubeRef} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            ref={holdRef}
            type="button"
            aria-label="Hold to enter"
            className="block p-[18px] outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--c-line)]"
            onKeyDown={(e) => {
              if (!isKey(e)) return;
              e.preventDefault();
              if (!e.repeat) press();
            }}
            onKeyUp={(e) => isKey(e) && release()}
            onBlur={release}
          >
            <canvas ref={canvasRef} className="block" style={{ width: CUBE_W, height: CUBE_H }} />
          </button>
        </div>

        {/* the prompt, under the cube */}
        <div ref={promptRef} className="absolute left-1/2 -translate-x-1/2">
          {/* The page's own section-label type (SectionLabel, "Hi, this is
              Vishal") — Geist Mono, uppercase, the aboutLabel token — so the
              gate reads as part of the site, not a borrowed screen. Set 2px
              up from the token's 12px, and in primary rather than its grey:
              alone on the screen it carries the moment, not a section. */}
          <p
            className="whitespace-pre font-mono uppercase"
            style={{ ...t(type.aboutLabel), fontSize: 14, lineHeight: `${PROMPT_LINE}px`, color: colors.primary }}
          >
            {PROMPT_TEXT}
            <span className="intro-cursor">_</span>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
