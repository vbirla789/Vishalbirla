"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { colors } from "../theme";
import PhotoLightbox from "./PhotoLightbox";

/* Photos shown in the strip. Click one to open the carousel. */
const photoSrcs = [
  "/timeline/1.jpg",
  "/timeline/2.jpg",
  "/timeline/3.jpg",
  "/timeline/4.jpg",
  "/timeline/5.jpg",
];

/* Ruler slots, left to right: a label every fifth tick, dots in between —
   the cadence in the reference. 15 slots covers 15s at one tick a second. */
const SLOTS = Array.from({ length: 15 }, (_, i) =>
  (i + 1) % 5 === 0 ? `${i + 1}s` : null,
);

/** Where the playhead rests before anyone touches it, as a % across the track. */
const REST_PCT = 22;

export default function PhotoStrip() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pinPct, setPinPct] = useState(REST_PCT);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const pctFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  }, []);

  const onPinDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      setPinPct(pctFromEvent(e.clientX));
    },
    [pctFromEvent],
  );

  const onPinMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPinPct(pctFromEvent(e.clientX));
    },
    [dragging, pctFromEvent],
  );

  const onPinUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  }, []);

  return (
    <div className="w-[376px] max-w-full select-none">
      {/* pt leaves room for the playhead's head, which sits above the ruler */}
      <div ref={trackRef} className="relative pt-[9px]">
        {/* Elapsed tint, left edge to the playhead. Behind the frames on
            purpose: in the reference it colours the ground the strip sits on,
            it doesn't wash over the photographs. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-0 ${
            dragging ? "" : "transition-[width] duration-500 ease-out"
          }`}
          style={{
            width: `${pinPct}%`,
            background: "color-mix(in srgb, var(--c-accent) 18%, transparent)",
          }}
        />

        {/* ruler: dots, with a label every fifth tick */}
        <div
          aria-hidden
          className="relative z-10 flex h-[14px] items-center"
          style={{ color: colors.tertiary }}
        >
          {SLOTS.map((label, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              {label ? (
                <span className="text-[9px] font-semibold leading-none">{label}</span>
              ) : (
                <span
                  className="h-[2px] w-[2px] rounded-full"
                  style={{ backgroundColor: colors.tertiary }}
                />
              )}
            </div>
          ))}
        </div>

        {/* filmstrip: equal frames, butted up against each other */}
        <div className="relative z-10 mt-[6px] flex gap-[3px]">
          {photoSrcs.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label="Open photo"
              /* Taller than wide, as in the reference — five frames across
                 376px give ~73px each, so 92px tall puts them in portrait. */
              className="group relative block h-[92px] flex-1 cursor-pointer overflow-hidden rounded-[6px] outline-none"
              style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.88)" }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                quality={90}
                priority
                /* Grey at rest, true colour on hover — the treatment the rest
                   of the page gives photographs. */
                className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
              />
            </button>
          ))}
        </div>

        {/* playhead: head above the ruler, line down through the frames */}
        <div
          className={`absolute top-0 z-20 flex h-full w-6 -translate-x-1/2 justify-center ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          } ${dragging ? "" : "transition-[left] duration-500 ease-out"}`}
          style={{ left: `${pinPct}%`, touchAction: "none" }}
          onPointerDown={onPinDown}
          onPointerMove={onPinMove}
          onPointerUp={onPinUp}
          onPointerCancel={onPinUp}
          role="slider"
          aria-label="Scrub the strip"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pinPct)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPinPct((p) => Math.max(0, p - 4));
            if (e.key === "ArrowRight") setPinPct((p) => Math.min(100, p + 4));
          }}
        >
          <span
            className="pointer-events-none absolute top-0 h-[15px] w-[15px] rounded-full"
            style={{ backgroundColor: colors.accent }}
          />
          <span
            className="pointer-events-none absolute bottom-0 top-[7px] w-[2px]"
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>

      {/* lightbox / carousel */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={photoSrcs}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
