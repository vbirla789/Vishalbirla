"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../theme";
import { playHover, playSuccess } from "../lib/sound";

/* ----------------------------------------------------------------------------
 * Intro loader — a self-playing block animation shown before the homepage.
 *
 * A 1×2 accent block falls toward a stack with a two-deep notch in it, sliding
 * one column per tick toward the gap so it drops into place on its own. It
 * fits, a ripple crosses the stack, and the overlay dissolves into the page.
 * Pixel blocks + accent squares are already the site's language (Geist Pixel,
 * dither grid, SectionRule intersections), so this reads as the brand rather
 * than a bolt-on.
 *
 * Nothing is asked of the visitor — it was briefly a game they steered, and
 * that made a loading screen into a task. Hence: no controls, no hint, no miss
 * state, and a much faster tick.
 *
 * Ground rules (the preloader literature is unambiguous about these):
 * - Always skippable — Skip button + Escape. It must never gate content.
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
/* One row of fall per tick. A calm, deliberate descent: 165ms read as the
   block being dropped, which undersold the moment it slides into the gap.
   Seven ticks, so the fall is ~2.1s and the whole intro ~3.7s. */
const TICK_MS = 300;

/* The piece's horizontal/vertical tween, derived from the tick rather than
   hardcoded: it has to finish just before the next step or the glide either
   stutters (too short) or never arrives (too long). Change TICK_MS alone. */
const PIECE_GLIDE = (TICK_MS - 45) / 1000;
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

/* won = ripple across the stack; zoom = structure leaves, then tiles clear */
/* No "missed": the block steers itself into the gap, so a miss is unreachable. */
type Status = "falling" | "won" | "zoom";

/* Pixel-dissolve mosaic. Tiles are sized in CSS pixels, not a fixed column
   count: 20 columns meant 100px slabs on a 2000px screen, which read as blocks
   popping rather than a dissolve. ~44px keeps them fine at any width. */
const TILE_PX = 44;

/* The exit is one continuous motion, so these are tuned to hand off with no
   dead frame between them:
     ripple (RIPPLE_MS) → structure fades (STRUCTURE_FADE) → tiles clear
   Every earlier version parked on a static screen twice — an 850ms ripple hold
   and then a stretch with the tiles solid and nothing moving. That pause is
   what read as the animation stopping. */
/* These deliberately OVERLAP rather than queue. Running them back-to-back
   still left dead windows — measured a 245ms stretch where the ripple had
   finished, the board hadn't started fading, and no tile had moved. Each
   stage now begins while the previous one is still going. */
const RIPPLE_MS = 300; // land → structure starts leaving, wave still mid-flight
const STRUCTURE_FADE = 0.2; // seconds; board/title/controls leaving
/* Under STRUCTURE_FADE on purpose: the first tiles clear while the board is
   still on its way out (~25% opacity), so there is never a frame with nothing
   in motion. */
const CLEAR_HOLD = 120;
const TILE_STAGGER = 620; // spread of the dissolve across the grid
const TILE_FADE = 620; // per-tile fade (see .intro-tile in globals.css)

export default function IntroPuzzle() {
  const [show, setShow] = useState(false);
  const [gapCol, setGapCol] = useState(1);
  const [piece, setPiece] = useState({ col: SPAWN_COL, row: 0 });
  const [status, setStatus] = useState<Status>("falling");

  const [mosaic, setMosaic] = useState<{
    cols: number;
    rows: number;
    tiles: { i: number; delay: number; shade: number }[];
  }>({ cols: 0, rows: 0, tiles: [] });

  /* Mount gate. Off-centre gap only, so the puzzle always needs at least two
     moves — a gap under the spawn point would win itself. */
  useEffect(() => {
    if (sessionStorage.getItem("intro-played")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* Skip entirely in a background tab. Timers keep firing while a document
       is hidden but animations do not advance, so the sequence would run its
       clock out with nothing moving and leave a half-exited overlay covering
       the page. Mark it played so it doesn't ambush them later either. */
    if (document.hidden) {
      sessionStorage.setItem("intro-played", "1");
      return;
    }
    const options = [0, 1, 2, 6, 7, 8];
    setGapCol(options[Math.floor(Math.random() * options.length)]);
    setShow(true);
  }, []);

  const close = useCallback(() => {
    sessionStorage.setItem("intro-played", "1");
    setShow(false);
  }, []);

  /* Gravity + auto-steer. The block drops a row per tick and simultaneously
     steps one column toward the gap, so it slides into place on its own — this
     is a loading animation, not a game, and nothing waits on the visitor.
     It therefore always lands in the notch; there is no miss state.

     One interval per fall; landing flips status, which tears the interval down
     via the dependency. */
  useEffect(() => {
    if (!show || status !== "falling") return;
    const id = setInterval(() => {
      setPiece((p) => {
        const col = p.col + Math.sign(gapCol - p.col);
        const limit = restRow(col, gapCol);
        if (p.row + 2 > limit) {
          setStatus("won");
          return { ...p, col };
        }
        return { col, row: p.row + 1 };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [show, status, gapCol]);

  /* The fit: one continuous exit — chord + ripple through the stack, the
     structure leaving while that wave is still travelling, and the tiles
     clearing the moment it's gone. See the timing constants above. */
  useEffect(() => {
    if (!show) return;
    if (status === "won") {
      playSuccess();
      /* Build the grid HERE, not at mount: it has to match the viewport at the
         moment of the exit (the window may have been resized since), and
         measuring during the first render can read a 0×0 window in a
         background tab or collapsed frame, which silently yields no tiles at
         all. The fallbacks guarantee a grid regardless. */
      const w = window.innerWidth || document.documentElement.clientWidth || 1280;
      const h = window.innerHeight || document.documentElement.clientHeight || 800;
      const cols = Math.max(8, Math.ceil(w / TILE_PX));
      const rows = Math.max(6, Math.ceil(h / TILE_PX));
      setMosaic({
        cols,
        rows,
        tiles: Array.from({ length: cols * rows }, (_, i) => ({
          i,
          delay: CLEAR_HOLD + Math.round(Math.random() * TILE_STAGGER),
          /* Only a whisper of tonal variation. At 0-14% the tiles formed a
             harsh light/dark checkerboard over the page; 0-5% still reads as
             pixel texture but dissolves evenly. */
          shade: [0, 0, 0, 2, 3, 5][Math.floor(Math.random() * 6)],
        })),
      });
      /* Hand off while the ripple is still travelling, so the structure starts
         leaving before the wave settles — no beat where the screen is still. */
      const t = setTimeout(() => setStatus("zoom"), RIPPLE_MS);
      return () => clearTimeout(t);
    }
    if (status === "zoom") {
      /* No slack term: the last tile hits zero at exactly this point, and any
         padding is a stretch of fully-transparent overlay still mounted —
         measured as a 168ms dead tail. */
      const t = setTimeout(close, CLEAR_HOLD + TILE_STAGGER + TILE_FADE);
      return () => clearTimeout(t);
    }
  }, [status, show, close]);

  /* Escape still skips — it plays itself, but a visitor who has seen it once
     this session shouldn't have to sit through it again. */
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [show, close]);

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
          /* During the zoom the solid background hands over to the mosaic in
             the same commit — the tiles ARE the background, and they clear one
             by one to reveal the page. No root fade: that would take the tiles
             with it. */
          style={{ backgroundColor: status === "zoom" ? "transparent" : colors.background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          /* Near-instant: by unmount every tile is already at zero opacity, so
             a real exit fade is just more transparent overlay on screen. */
          exit={{ opacity: 0, transition: { duration: 0.06 } }}
          transition={{ duration: 0.3, ease: EASE }}
          role="dialog"
          aria-modal
          aria-label="Intro puzzle — fit the block, or skip"
        >
          {/* Pixel-dissolve exit: a fine grid of tiles that fade away in
              random order to reveal the page underneath.

              Mounted from the WON phase, not the zoom, so the cost of ~1000
              nodes lands during the ripple rather than as a hitch the instant
              the animation starts. They're invisible until then — the root
              still has its solid background behind them, and a tile only gets
              its animation class in the zoom phase. */}
          {(status === "won" || status === "zoom") && (
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ opacity: status === "zoom" ? 1 : 0 }}
            >
              {mosaic.tiles.map(({ i, delay, shade }) => (
                <div
                  key={i}
                  className={`absolute ${status === "zoom" ? "intro-tile" : ""}`}
                  style={{
                    left: `${((i % mosaic.cols) * 100) / mosaic.cols}%`,
                    top: `${(Math.floor(i / mosaic.cols) * 100) / mosaic.rows}%`,
                    /* padded a hair so neighbours never leave a hairline seam */
                    width: `calc(${100 / mosaic.cols}% + 1px)`,
                    height: `calc(${100 / mosaic.rows}% + 1px)`,
                    backgroundColor: `color-mix(in srgb, var(--c-primary) ${shade}%, var(--c-background))`,
                    ["--d" as string]: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* skip — always visible, per every preloader guideline in existence */}
          <motion.button
            type="button"
            onClick={() => {
              playHover();
              close();
            }}
            animate={{ opacity: status === "zoom" ? 0 : 1 }}
            transition={{ duration: STRUCTURE_FADE, ease: "easeOut" }}
            className="absolute right-5 top-5 flex h-9 items-center gap-1 rounded-full px-4 font-mono text-[11px] uppercase tracking-wide outline-none transition-colors hover:bg-[color:var(--c-tab-active-bg)] focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40"
            style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
          >
            Skip →
          </motion.button>

          {/* title + brief — fades early in the zoom so the dissolve owns the
              moment */}
          <motion.div
            animate={{ opacity: status === "zoom" ? 0 : 1 }}
            transition={{ duration: STRUCTURE_FADE, ease: "easeOut" }}
            className="mb-5 flex items-center gap-3">
            <DropDot />
            <p
              className="font-mono text-[11px] uppercase tracking-wide"
              style={{ color: colors.tertiary }}
            >
              {status === "won" || status === "zoom" ? "Perfect fit" : "Loading portfolio"}
            </p>
          </motion.div>
          <motion.p
            animate={{ opacity: status === "zoom" ? 0 : 1 }}
            transition={{ duration: STRUCTURE_FADE, ease: "easeOut" }}
            className="mb-8 max-w-[340px] text-center text-[22px] leading-snug"
            style={{
              fontFamily: "var(--font-geist-pixel), ui-monospace, monospace",
              color: colors.primary,
            }}
          >
            {status === "won" || status === "zoom"
              ? "Welcome in."
              : "One block short of a portfolio"}
            {/* Copy stays the same: it reads as a loading state, not a task —
                which is what it is now that nothing is asked of the visitor. */}
          </motion.p>

          {/* board — hairline frame with accent squares at the corners, echoing
              the structure grid's intersection marks */}
          <motion.div
            className="relative w-[min(82vw,324px)]"
            /* The board does NOT scale on the way out. It used to blow up to 7x
               as a fly-through, which turned the game's own blocks into
               enormous slabs across the page — that read as broken layout, not
               depth. It just leaves, and the tiles do the reveal. */
            animate={status === "zoom" ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: STRUCTURE_FADE, ease: "easeOut" }}
            style={{ aspectRatio: `${COLS} / ${ROWS}` }}
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
                      ? /* Tightened so the wave crosses the board inside
                           RIPPLE_MS — it used to run ~940ms against an 850ms
                           hold, so it was still mid-flight when the phase
                           changed and the cut showed. */
                        { duration: 0.34, delay: Math.abs(c - gapCol) * 0.03, ease: "easeOut" }
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
                /* Slides horizontally as it drops — the auto-steer changes col
                   on the same tick as row, and this tween is what makes that a
                   diagonal glide rather than a jump. PIECE_GLIDE tracks
                   TICK_MS so the two can't drift apart. */
                animate={cellPos(r, piece.col)}
                transition={{ duration: PIECE_GLIDE, ease: "easeInOut" }}
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

          {/* No controls and no hint: the block steers itself, so there is
              nothing to press and nothing to explain. Skip stays, top right. */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
