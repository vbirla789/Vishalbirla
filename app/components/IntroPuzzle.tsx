"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../theme";
import { playError, playHover, playSuccess } from "../lib/sound";

/* ----------------------------------------------------------------------------
 * Intro puzzle — a one-move block game shown before the homepage.
 *
 * A 1×2 accent block falls toward a stack with a two-deep notch in it; steer
 * with ← / → (or tap the side zones) so it lands in the notch. Fit it and the
 * overlay lifts to reveal the page. Pixel blocks + accent squares are already
 * the site's language (Geist Pixel, dither grid, SectionRule intersections),
 * so the game IS the brand, not a bolt-on.
 *
 * Ground rules (the preloader literature is unambiguous about these):
 * - Always skippable — Skip button + Escape. The game must never gate content.
 * - Once per session (sessionStorage) — returning visitors go straight in.
 * - Zero assets: DOM squares and CSS only, so the loader can't cost load time.
 * - prefers-reduced-motion users never see it at all.
 *
 * The homepage renders underneath from the first paint — this is an overlay,
 * not a gate, so SEO/SSR are untouched.
 * --------------------------------------------------------------------------*/

const COLS = 9;
const ROWS = 9;
const STACK_H = 3; // stack occupies the bottom 3 rows
const TICK_MS = 500; // one row of fall per tick — unhurried; 380 felt rushed
const SPAWN_COL = 4; // centre
const EASE = [0.22, 1, 0.36, 1] as const;

/* Where a piece's BOTTOM cell comes to rest, per column: into the notch on the
   gap column (its floor is the final row), on top of the stack elsewhere. */
const restRow = (col: number, gapCol: number) =>
  col === gapCol ? ROWS - 2 : ROWS - STACK_H - 1;

/** Bouncing-dot loader beside the LOADING label — a dot drops onto a soft
 *  shadow with a little squash on impact. Sized to the label: the whole
 *  loader is 11px tall, matching the type beside it. Primary-token dot, so
 *  it's white on dark and near-black on light. */
function DropDot() {
  return (
    <div className="relative flex h-[11px] w-[11px] flex-col items-center">
      <motion.div
        className="absolute top-0 z-10 h-[4px] w-[4px] rounded-full"
        style={{ backgroundColor: colors.primary }}
        animate={{ y: [0, 6, 0], scaleY: [1, 1.2, 1], scaleX: [1, 0.8, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "circIn" }}
      />
      <div
        className="absolute bottom-0 h-[1.5px] w-[8px] rounded-full blur-[1px]"
        style={{ backgroundColor: colors.tertiary, opacity: 0.5 }}
      />
    </div>
  );
}

/* won = ripple + pulse on the board; zoom = fly-through exit that follows it */
type Status = "falling" | "missed" | "won" | "zoom";

export default function IntroPuzzle() {
  const [show, setShow] = useState(false);
  const [gapCol, setGapCol] = useState(1);
  const [piece, setPiece] = useState({ col: SPAWN_COL, row: 0 });
  const [status, setStatus] = useState<Status>("falling");
  const [misses, setMisses] = useState(0);

  /* Mount gate. Off-centre gap only, so the puzzle always needs at least two
     moves — a gap under the spawn point would win itself. */
  useEffect(() => {
    if (sessionStorage.getItem("intro-played")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const options = [0, 1, 2, 6, 7, 8];
    setGapCol(options[Math.floor(Math.random() * options.length)]);
    setShow(true);
  }, []);

  const close = useCallback(() => {
    sessionStorage.setItem("intro-played", "1");
    setShow(false);
  }, []);

  /* Gravity. One interval per fall; landing flips status, which tears the
     interval down via the dependency. */
  useEffect(() => {
    if (!show || status !== "falling") return;
    const id = setInterval(() => {
      setPiece((p) => {
        const limit = restRow(p.col, gapCol);
        if (p.row + 2 > limit) {
          setStatus(p.col === gapCol ? "won" : "missed");
          return p;
        }
        return { ...p, row: p.row + 1 };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [show, status, gapCol]);

  /* Miss: soft error, brief pause, new piece.
     Win: chord + shockwave ripple through the stack (~0.85s), then the zoom
     phase — the board scales up around the filled gap while the overlay
     dissolves, so the exit reads as flying through the hole into the page. */
  useEffect(() => {
    if (!show) return;
    if (status === "missed") {
      playError();
      const t = setTimeout(() => {
        setPiece({ col: SPAWN_COL, row: 0 });
        setMisses((m) => m + 1);
        setStatus("falling");
      }, 550);
      return () => clearTimeout(t);
    }
    if (status === "won") {
      playSuccess();
      const t = setTimeout(() => setStatus("zoom"), 850);
      return () => clearTimeout(t);
    }
    if (status === "zoom") {
      const t = setTimeout(close, 750);
      return () => clearTimeout(t);
    }
  }, [status, show, close]);

  const move = useCallback(
    (dir: -1 | 1) => {
      if (status !== "falling") return;
      playHover();
      setPiece((p) => ({ ...p, col: Math.min(COLS - 1, Math.max(0, p.col + dir)) }));
    },
    [status],
  );

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") move(-1);
      else if (e.key === "ArrowRight" || e.key === "d") move(1);
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [show, move, close]);

  /* ---- board cells ---------------------------------------------------- */
  const stackCells: { r: number; c: number }[] = [];
  for (let r = ROWS - STACK_H; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const inNotch = c === gapCol && r < ROWS - 1; // two-deep notch, floored
      if (!inNotch) stackCells.push({ r, c });
    }
  }
  const cellPos = (r: number, c: number) => ({
    left: `${(c * 100) / COLS}%`,
    top: `${(r * 100) / ROWS}%`,
    width: `${100 / COLS}%`,
    height: `${100 / ROWS}%`,
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10020] flex flex-col items-center justify-center px-6"
          style={{ backgroundColor: colors.background }}
          initial={{ opacity: 0 }}
          /* the zoom phase dissolves the whole overlay while the board scales
             up beneath — by the time AnimatePresence exit runs, opacity is
             already 0, so unmount is seamless */
          animate={{ opacity: status === "zoom" ? 0 : 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: status === "zoom" ? 0.6 : 0.3, ease: EASE }}
          role="dialog"
          aria-modal
          aria-label="Intro puzzle — fit the block, or skip"
        >
          {/* skip — always visible, per every preloader guideline in existence */}
          <button
            type="button"
            onClick={() => {
              playHover();
              close();
            }}
            className="absolute right-5 top-5 flex h-9 items-center gap-1 rounded-full px-4 font-mono text-[11px] uppercase tracking-wide outline-none transition-colors hover:bg-[color:var(--c-tab-active-bg)] focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40"
            style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
          >
            Skip →
          </button>

          {/* title + brief */}
          <div className="mb-5 flex items-center gap-3">
            <DropDot />
            <p
              className="font-mono text-[11px] uppercase tracking-wide"
              style={{ color: colors.tertiary }}
            >
              {status === "won" || status === "zoom" ? "Perfect fit" : "Loading portfolio"}
            </p>
          </div>
          <p
            className="mb-8 max-w-[340px] text-center text-[22px] leading-snug"
            style={{
              fontFamily: "var(--font-geist-pixel), ui-monospace, monospace",
              color: colors.primary,
            }}
          >
            {status === "won" || status === "zoom"
              ? "Welcome in."
              : "One block short of a portfolio"}
          </p>

          {/* board — hairline frame with accent squares at the corners, echoing
              the structure grid's intersection marks */}
          <motion.div
            className="relative w-[min(82vw,324px)]"
            /* zoom-through: scale up anchored on the gap column near the stack,
               so the camera flies through the hole the player just filled */
            animate={status === "zoom" ? { scale: 7 } : { scale: 1 }}
            transition={{ duration: 0.75, ease: EASE }}
            style={{
              aspectRatio: `${COLS} / ${ROWS}`,
              transformOrigin: `${((gapCol + 0.5) * 100) / COLS}% 82%`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `inset 0 0 0 1px ${colors.line}` }}
            />
            {[
              { left: 0, top: 0 }, { right: 0, top: 0 },
              { left: 0, bottom: 0 }, { right: 0, bottom: 0 },
            ].map((pos, i) => (
              <div
                key={i}
                aria-hidden
                className="absolute h-[5px] w-[5px]"
                style={{
                  ...pos,
                  transform: `translate(${"left" in pos ? "-50%" : "50%"}, ${"top" in pos ? "-50%" : "50%"})`,
                  backgroundColor: colors.accent,
                }}
              />
            ))}

            {/* stack */}
            {stackCells.map(({ r, c }) => (
              <div key={`${r}-${c}`} className="absolute" style={cellPos(r, c)}>
                <div
                  className="absolute inset-[8%]"
                  style={{
                    backgroundColor: "var(--c-panel)",
                    boxShadow: `inset 0 0 0 1px ${colors.line}`,
                  }}
                />
                {/* win shockwave: every cell flashes accent, delayed by its
                    distance from the landing column, so a wave radiates out
                    from the fit. (A white scale-up variant was tried and
                    reverted — the orange read better.) */}
                <motion.div
                  className="absolute inset-[8%]"
                  style={{ backgroundColor: colors.accent }}
                  initial={{ opacity: 0 }}
                  animate={
                    status === "won" || status === "zoom"
                      ? { opacity: [0, 1, 0] }
                      : { opacity: 0 }
                  }
                  transition={
                    status === "won"
                      ? { duration: 0.5, delay: Math.abs(c - gapCol) * 0.055, ease: "easeOut" }
                      : { duration: 0 }
                  }
                />
              </div>
            ))}

            {/* falling piece (1×2) */}
            {[piece.row, piece.row + 1].map((r, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  ...cellPos(r, piece.col),
                  ...(status === "missed" ? { x: [0, -5, 5, -3, 0] } : {}),
                }}
                transition={{ duration: 0.16, ease: "linear" }}
                initial={false}
              >
                <motion.div
                  className="absolute inset-[8%]"
                  style={{ backgroundColor: colors.accent }}
                  animate={status === "won" ? { opacity: [1, 0.35, 1, 0.35, 1] } : { opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </motion.div>
            ))}

          </motion.div>

          {/* controls — an explicit arrow pair UNDER the board. They started as
              full-height side zones, which read as a carousel rather than game
              input; down here they say "press me", and mirror the ← → keys. */}
          <div className="mt-7 flex items-center gap-3">
            <button
              type="button"
              aria-label="Move block left"
              onClick={() => move(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors hover:bg-[color:var(--c-tab-active-bg)] focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40 active:scale-95"
              style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Move block right"
              onClick={() => move(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors hover:bg-[color:var(--c-tab-active-bg)] focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40 active:scale-95"
              style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* hint — nudges toward the gap after two misses */}
          <p
            className="mt-5 font-mono text-[11px] uppercase tracking-wide"
            style={{ color: colors.tertiary }}
          >
            {misses >= 2 && status !== "won"
              ? `The gap is on the ${gapCol < SPAWN_COL ? "left" : "right"}`
              : "Tap · or use ← → keys"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
