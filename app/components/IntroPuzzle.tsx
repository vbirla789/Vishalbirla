"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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

/* ---- exit: the box extends into the page ---------------------------------
   Four panels in the page's own background colour cover everything OUTSIDE
   the board. Sliding them off-screen grows the board's opening until it is
   the whole viewport — so the little framed box literally becomes the
   portfolio, with its accent corner marks travelling out to the viewport
   corners.

   Panels rather than scaling the board: scaling took the blocks with it and
   turned them into enormous slabs. Panels only ever translate, so nothing
   inside the frame can distort. */

/* Stages overlap rather than queue — running them back-to-back left dead
   windows where nothing on screen was moving, which read as the animation
   stopping. */
const RIPPLE_MS = 520; // land → the box starts opening, wave still travelling
const STRUCTURE_FADE = 0.24; // seconds; blocks + chrome leaving
const EXPAND_MS = 900; // the opening growing to fill the viewport
/* Panels start moving before the blocks have finished fading, so the box is
   already opening as its contents leave. */
const EXPAND_EASE = [0.65, 0, 0.35, 1] as const;

export default function IntroPuzzle() {
  const [show, setShow] = useState(false);
  const [gapCol, setGapCol] = useState(1);
  const [piece, setPiece] = useState({ col: SPAWN_COL, row: 0 });
  const [status, setStatus] = useState<Status>("falling");

  /* The board's on-screen rect, captured the moment the exit begins. The
     panels and the travelling corner marks are both positioned from it. */
  const boardRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<{
    top: number; left: number; right: number; bottom: number;
    width: number; height: number; vw: number; vh: number;
  } | null>(null);

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
      /* Measure the board HERE, not at mount: the panels have to match where
         it actually sits now (the window may have been resized), and reading
         during the first render can catch a 0×0 viewport in a collapsed frame.
         Fall back to a centred 320px box so the exit still plays if the
         measurement is degenerate. */
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const r = boardRef.current?.getBoundingClientRect();
      const box =
        r && r.width > 1
          ? r
          : { left: vw / 2 - 160, top: vh / 2 - 160, right: vw / 2 + 160, bottom: vh / 2 + 160, width: 320, height: 320 };
      setFrame({
        top: box.top, left: box.left, right: box.right, bottom: box.bottom,
        width: box.width, height: box.height, vw, vh,
      });
      /* Hand off while the ripple is still travelling, so the box starts
         opening before the wave settles — no beat where the screen is still. */
      const t = setTimeout(() => setStatus("zoom"), RIPPLE_MS);
      return () => clearTimeout(t);
    }
    if (status === "zoom") {
      const t = setTimeout(close, EXPAND_MS);
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
          /* Once the panels exist they provide the cover, so the root's own
             background steps aside in the same commit — otherwise it would sit
             over the page and there'd be nothing for the box to open onto. */
          style={{ backgroundColor: frame ? "transparent" : colors.background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.06 } }}
          transition={{ duration: 0.3, ease: EASE }}
          role="dialog"
          aria-modal
          aria-label="Intro puzzle — fit the block, or skip"
        >
          {/* The four panels covering everything outside the board. They sit
              still through the `won` beat, then slide off-screen so the board's
              opening grows into the whole viewport. Transform only — nothing
              re-lays-out, and nothing inside the frame can be distorted. */}
          {frame && (
            <div aria-hidden className="absolute inset-0 -z-10">
              {[
                { k: "t", s: { left: 0, top: 0, width: frame.vw, height: frame.top }, to: { y: -frame.top } },
                { k: "b", s: { left: 0, top: frame.bottom, width: frame.vw, height: frame.vh - frame.bottom }, to: { y: frame.vh - frame.bottom } },
                { k: "l", s: { left: 0, top: frame.top, width: frame.left, height: frame.height }, to: { x: -frame.left } },
                { k: "r", s: { left: frame.right, top: frame.top, width: frame.vw - frame.right, height: frame.height }, to: { x: frame.vw - frame.right } },
              ].map(({ k, s, to }) => (
                <motion.div
                  key={k}
                  className="absolute"
                  style={{ ...s, backgroundColor: colors.background }}
                  initial={{ x: 0, y: 0 }}
                  animate={status === "zoom" ? to : { x: 0, y: 0 }}
                  transition={{ duration: EXPAND_MS / 1000, ease: EXPAND_EASE }}
                />
              ))}
            </div>
          )}

          {/* The accent corner marks ride the opening out to the viewport
              corners — the same squares the section rules use, which is what
              ties the intro to the page it opens onto. */}
          {frame && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
              {[
                { k: "tl", left: frame.left, top: frame.top, to: { x: -frame.left, y: -frame.top } },
                { k: "tr", left: frame.right, top: frame.top, to: { x: frame.vw - frame.right, y: -frame.top } },
                { k: "bl", left: frame.left, top: frame.bottom, to: { x: -frame.left, y: frame.vh - frame.bottom } },
                { k: "br", left: frame.right, top: frame.bottom, to: { x: frame.vw - frame.right, y: frame.vh - frame.bottom } },
              ].map(({ k, left, top, to }) => (
                <motion.div
                  key={k}
                  className="absolute h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top, backgroundColor: colors.accent }}
                  initial={{ x: 0, y: 0 }}
                  animate={status === "zoom" ? { ...to, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
                  transition={{
                    duration: EXPAND_MS / 1000,
                    ease: EXPAND_EASE,
                    opacity: { delay: EXPAND_MS / 1000 - 0.25, duration: 0.25 },
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
            ref={boardRef}
            className="relative w-[min(82vw,324px)]"
            /* The board itself never scales — only its contents fade while the
               panels open around it. Scaling it took the blocks along and
               turned them into enormous slabs. */
            animate={status === "zoom" ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: STRUCTURE_FADE, ease: "easeOut" }}
            style={{ aspectRatio: `${COLS} / ${ROWS}` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `inset 0 0 0 1px ${colors.line}` }}
            />
            {/* Static corner marks. Hidden the instant the travelling pair is
                mounted, so the two never double up on the same corner. */}
            {!frame && [
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
