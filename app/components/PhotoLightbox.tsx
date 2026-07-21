"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

/* ----------------------------------------------------------------------------
 * Full-screen photo lightbox / carousel.
 * - Dark, blurred backdrop that fades in/out.
 * - Slide + fade transition between photos (direction-aware).
 * - Arrow buttons, ← / → keys, swipe (drag), and dot indicators.
 * - Closes on backdrop click, the ✕ button, or Escape. Locks page scroll.
 * --------------------------------------------------------------------------*/

const EASE = [0.22, 1, 0.36, 1] as const;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.98 }),
};

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, paginate]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      {/* close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* prev */}
      <button
        type="button"
        onClick={(e) => { stop(e); paginate(-1); }}
        aria-label="Previous"
        className="fixed left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6 sm:flex"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* stage — photo inside a polaroid frame */}
      <div className="flex h-[82vh] w-full max-w-[480px] items-center justify-center" onClick={stop}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={index}
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
            className="cursor-grab rounded-[16px] bg-white p-3 pb-8 shadow-2xl active:cursor-grabbing"
          >
            {/* fixed-size frame — image fits inside regardless of orientation */}
            <div className="aspect-[3/4] h-[56vh] max-h-[540px] overflow-hidden rounded-[8px] bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[index]}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* next */}
      <button
        type="button"
        onClick={(e) => { stop(e); paginate(1); }}
        aria-label="Next"
        className="fixed right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:flex"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* dots */}
      <div className="fixed inset-x-0 bottom-6 flex items-center justify-center gap-2" onClick={stop}>
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => setState(([cur]) => [i, i > cur ? 1 : -1])}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
