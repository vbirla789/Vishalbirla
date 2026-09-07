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
const TICK_MS = 380; // one row of fall per tick
const SPAWN_COL = 4; // centre
const EASE = [0.22, 1, 0.36, 1] as const;

/* Where a piece's BOTTOM cell comes to rest, per column: into the notch on the
   gap column (its floor is the final row), on top of the stack elsewhere. */
const restRow = (col: number, gapCol: number) =>
  col === gapCol ? ROWS - 2 : ROWS - STACK_H - 1;

type Status = "falling" | "missed" | "won";

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

  /* Miss: soft error, brief pause, new piece. Win: chord, then lift. */
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
      const t = setTimeout(close, 1200);
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
          animate={{ opacity: 1 }}
          exit={{ y: "-100%", transition: { duration: 0.65, ease: EASE } }}
          transition={{ duration: 0.3, ease: EASE }}
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
          <p
            className="mb-2 font-mono text-[11px] uppercase tracking-wide"
            style={{ color: colors.tertiary }}
          >
            {status === "won" ? "Perfect fit" : "Loading portfolio"}
          </p>
          <p
            className="mb-8 text-center text-[22px] leading-tight"
            style={{
              fontFamily: "var(--font-geist-pixel), ui-monospace, monospace",
              color: colors.primary,
            }}
          >
            {status === "won" ? "Welcome in." : "Fit the last block"}
          </p>

          {/* board — hairline frame with accent squares at the corners, echoing
              the structure grid's intersection marks */}
          <div
            className="relative w-[min(82vw,324px)]"
            style={{
              aspectRatio: `${COLS} / ${ROWS}`,
              /* How far the tap-zone chevrons sit outside the board: 56px on
                 wide screens, clamped so they never leave the viewport on
                 phones — (100vw - board)/2 is the gutter, minus a 12px inset.
                 Resolved where it's used (the absolute children), so 100%
                 means the board width. */
              ["--zone" as string]: "min(3.5rem, (100vw - 100%) / 2 - 12px)",
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

            {/* tap zones — full-height halves, chevrons pinned at the edges */}
            <button
              type="button"
              aria-label="Move block left"
              onClick={() => move(-1)}
              className="absolute left-[calc(var(--zone)*-1)] top-0 flex h-full w-[calc(50%+var(--zone))] items-center justify-start outline-none"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              aria-label="Move block right"
              onClick={() => move(1)}
              className="absolute right-[calc(var(--zone)*-1)] top-0 flex h-full w-[calc(50%+var(--zone))] items-center justify-end outline-none"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
          </div>

          {/* hint — nudges toward the gap after two misses */}
          <p
            className="mt-8 font-mono text-[11px] uppercase tracking-wide"
            style={{ color: colors.tertiary }}
          >
            {misses >= 2 && status !== "won"
              ? `The gap is on the ${gapCol < SPAWN_COL ? "left" : "right"}`
              : "← → move · tap sides"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
