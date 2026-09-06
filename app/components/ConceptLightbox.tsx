"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { colors } from "../theme";
import { playHover } from "../lib/sound";

/* ----------------------------------------------------------------------------
 * Concept detail overlay — inspora.design-style.
 *
 * Clicking a Concepts card morphs its media into a large stage on the LEFT
 * (a framer-motion layoutId shared-element transition with the card in
 * WorkSection — the two must keep the same `concept-${src}` id), while a
 * details sidebar slides in on the RIGHT. ← / → move between concepts,
 * Escape or ✕ closes, and the stage morphs back into whichever card is
 * currently shown: the layoutId is dynamic, so after navigating, close
 * returns to THAT concept's card rather than the one first clicked.
 *
 * Same shell conventions as PhotoLightbox: fixed overlay, scroll lock,
 * direction-aware slide between items, EASE curve shared with the site.
 * --------------------------------------------------------------------------*/

const EASE = [0.22, 1, 0.36, 1] as const;

export type Concept = {
  src: string;
  title: string;
  year: string;
  /** Where the concept was made — "Personal", "noon", … */
  project: string;
  blurb: string;
};

const mediaVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -64 : 64, opacity: 0 }),
};

/** Small round control, matching the site's muted-button language. */
function RoundButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full outline-none transition-colors hover:bg-[color:var(--c-tab-active-bg)] focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40"
      style={{ color: colors.secondary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
    >
      {children}
    </button>
  );
}

export default function ConceptLightbox({
  concepts,
  index,
  direction,
  onClose,
  onNavigate,
}: {
  concepts: Concept[];
  index: number;
  /** -1 / 1 — which way the last navigation went, for the slide direction. */
  direction: number;
  onClose: () => void;
  onNavigate: (next: number, dir: number) => void;
}) {
  const c = concepts[index];

  const paginate = useCallback(
    (d: number) => {
      playHover();
      onNavigate((index + d + concepts.length) % concepts.length, d);
    },
    [index, concepts.length, onNavigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, paginate]);

  return (
    <motion.div
      /* Above the Ask Jarvis pill (z-9999) — PhotoLightbox's z-100 sits under it. */
      className="fixed inset-0 z-[10000] flex flex-col sm:flex-row"
      style={{ backgroundColor: colors.background }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      role="dialog"
      aria-modal
      aria-label={`${c.title} — concept details`}
    >
      {/* media stage — clicking the empty area closes, the panel itself doesn't.
          A scale-and-rise zoom rather than a layoutId morph from the card:
          the shared-element version deadlocked AnimatePresence — exiting
          children inside the layout-projected stage never resolved, so
          pagination stacked videos and Escape left the overlay stuck at
          opacity 0. This stays smooth and always completes. */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.45, ease: EASE }}
          /* The video is a full-bleed iPhone screen recording, so the clip has
             to read as a phone. A real iPhone's corner radius is ~6.4% of its
             screen height; the video is sized in vh (50 / 74 below), so the
             radius is expressed in vh at the same ratio and scales with it.
             A fixed 22px looked visibly too tight at ~765px tall. */
          className="relative overflow-hidden rounded-[3.2vh] bg-zinc-50 sm:rounded-[4.75vh] dark:bg-[color:var(--c-panel)]"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.video
              key={c.src}
              custom={direction}
              variants={mediaVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              className="block h-[50vh] w-auto object-contain sm:h-[74vh]"
              src={c.src}
              autoPlay
              loop
              muted
              playsInline
            />
          </AnimatePresence>
          {/* Hairline drawn OVER the media, not on the panel: the video hugs
              the panel exactly, so a ring on the panel itself is painted over
              along every edge and survives only at the clipped corners — which
              reads as a broken border. Last child, so it stacks above the
              exiting video during pagination too. */}
          {/* radius must match the panel above, or the ring traces the wrong curve */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[3.2vh] ring-1 ring-inset ring-black/5 sm:rounded-[4.75vh] dark:ring-[color:var(--c-line)]"
          />
        </motion.div>
      </div>

      {/* details sidebar */}
      <motion.aside
        className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t p-6 sm:w-[340px] sm:shrink-0 sm:border-l sm:border-t-0 sm:p-7"
        style={{ borderColor: colors.line }}
        initial={{ x: 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 36, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {/* controls row: close left, prev/next right — as in the reference */}
        <div className="flex items-center justify-between">
          <RoundButton label="Close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </RoundButton>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]" style={{ color: colors.tertiary }}>
              {index + 1} / {concepts.length}
            </span>
            <RoundButton label="Previous concept" onClick={() => paginate(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </RoundButton>
            <RoundButton label="Next concept" onClick={() => paginate(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </RoundButton>
          </div>
        </div>

        {/* text swaps with a small rise when navigating */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={c.src}
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <p className="font-mono text-[11px] uppercase tracking-wide" style={{ color: colors.tertiary }}>
              Concept · {c.year}
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: "27px",
                letterSpacing: "-0.01em",
                color: colors.primary,
              }}
            >
              {c.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: "22px", color: colors.secondary }}>
              {c.blurb}
            </p>

            {/* metadata — inside the keyed block so it swaps with the rest */}
            <div className="mt-3 border-t pt-4" style={{ borderColor: colors.line }}>
              <p
                className="font-mono text-[11px] uppercase tracking-wide"
                style={{ color: colors.tertiary }}
              >
                Project
              </p>
              <p className="mt-1" style={{ fontSize: 14, fontWeight: 500, color: colors.primary }}>
                {c.project}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.aside>
    </motion.div>
  );
}
