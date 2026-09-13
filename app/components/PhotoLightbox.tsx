"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useScrollLock } from "../lib/useScrollLock";

/* ----------------------------------------------------------------------------
 * Full-screen photo lightbox / carousel.
 * - Dark, blurred backdrop that fades in/out.
 * - The photograph sits on that backdrop unmounted — no card, no white.
 * - Slide + fade transition between photos (direction-aware).
 * - Close top-right; step back and forward from the bottom bar, ← / → keys,
 *   or a swipe. Closes on backdrop click or Escape. Locks page scroll.
 * --------------------------------------------------------------------------*/

const EASE = [0.22, 1, 0.36, 1] as const;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.98 }),
};

/** Round control, shared by close and the two step buttons. */
function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
    >
      {children}
    </button>
  );
}

export default function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [[index, dir], setState] = useState<[number, number]>([initialIndex, 0]);

  const paginate = useCallback(
    (d: number) => setState(([i]) => [(i + d + photos.length) % photos.length, d]),
    [photos.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, paginate]);

  useScrollLock();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 pb-20 pt-16 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      {/* close, top right */}
      <div className="fixed right-5 top-5" onClick={stop}>
        <ControlButton label="Close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </ControlButton>
      </div>

      {/* stage — the photograph itself, nothing behind it. object-contain so a
          portrait and a landscape shot both show whole rather than being
          cropped to a fixed frame, which is what the old card forced.

          No stopPropagation here: this box fills the viewport, so swallowing
          clicks on it meant the backdrop was only clickable in the thin strip
          of padding around it. The photo below stops its own clicks, which is
          the only thing that should. */}
      <div className="flex h-full w-full items-center justify-center">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.img
            key={index}
            src={photos[index]}
            alt=""
            draggable={false}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) paginate(1);
              else if (info.offset.x > 70) paginate(-1);
            }}
            onClick={stop}
            className="max-h-full max-w-full cursor-grab rounded-[8px] object-contain active:cursor-grabbing"
          />
        </AnimatePresence>
      </div>

      {/* step controls, bottom centre, with the position between them.

          The positioning strip runs the full width, so it is left click-through
          and only the controls themselves take the pointer — otherwise a click
          anywhere along the bottom of the screen would hit this instead of the
          backdrop and the overlay would refuse to close. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-3" onClick={stop}>
          <ControlButton label="Previous" onClick={(e) => { stop(e); paginate(-1); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </ControlButton>

          <span className="min-w-[56px] text-center text-[13px] tabular-nums text-white/70">
            {index + 1} of {photos.length}
          </span>

          <ControlButton label="Next" onClick={(e) => { stop(e); paginate(1); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </ControlButton>
        </div>
      </div>
    </motion.div>
  );
}
