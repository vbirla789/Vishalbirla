"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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

/* The track spans a waking day in IST: 6am on the left, 2am the next morning
   on the right. Hours past midnight are counted as 24+ so the window stays a
   single increasing range rather than wrapping to zero two thirds along. */
const DAY_START = 6;
const DAY_END = 26;

/** Where an hour of that window falls, as a % across the track. */
const pctForHour = (h: number) =>
  ((h - DAY_START) / (DAY_END - DAY_START)) * 100;

/* Marks every two hours. Four of them are labelled; the rest are dots.
   Both the labels and the playhead are placed by pctForHour, so a label can
   never drift away from the time the playhead is pointing at. */
const TICK_HOURS = Array.from({ length: 11 }, (_, i) => DAY_START + i * 2);
const LABELS: Record<number, string> = { 12: "12pm", 18: "6pm", 24: "12am" };

/** Current IST time as an hour in the 6 → 26 window, clamped to it. */
function hourNowIST(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const get = (k: string) => Number(parts.find((p) => p.type === k)?.value ?? 0);
  let h = get("hour") % 24;
  h += get("minute") / 60;
  if (h < DAY_START) h += 24; // the small hours belong to the tail, not the head
  return Math.min(DAY_END, Math.max(DAY_START, h));
}

export default function PhotoStrip() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [pinPct, setPinPct] = useState(pctForHour(DAY_START));
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Live clock. Set in an effect rather than at init so the server and the
     first client render agree — the server has no idea what time it is where
     the visitor is. */
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const restPct = now ? pctForHour(hourNowIST(now)) : pctForHour(DAY_START);

  /* Let go and it returns to the time. The clock keeps advancing while the
     playhead is held, so this also catches it up on release rather than
     dropping it back where it was picked up. */
  useEffect(() => {
    if (!dragging) setPinPct(restPct);
  }, [restPct, dragging]);

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
      <div ref={trackRef} className="relative pt-[7px]">
        {/* ruler: a mark every two hours, labelled at noon, 6pm and midnight */}
        <div
          aria-hidden
          className="relative z-10 h-[12px]"
          style={{ color: colors.tertiary }}
        >
          {TICK_HOURS.map((h) => {
            const label = LABELS[h];
            return (
              <span
                key={h}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pctForHour(h)}%` }}
              >
                {label ? (
                  <span className="text-[9px] font-semibold leading-none">{label}</span>
                ) : (
                  <span
                    className="block h-[2px] w-[2px] rounded-full"
                    style={{ backgroundColor: colors.tertiary }}
                  />
                )}
              </span>
            );
          })}
        </div>

        {/* filmstrip */}
        <div className="relative z-10 mt-[6px] flex gap-[4px]">
          {photoSrcs.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label="Open photo"
              className="group relative block h-[60px] flex-1 cursor-pointer overflow-hidden rounded-[2px] outline-none"
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

        {/* playhead: small head above the ruler, hairline down through the
            frames. Deliberately slight — at 15px across with a 2px stem it
            was the loudest thing on the page. */}
        <div
          className={`absolute top-0 z-20 flex h-full w-5 -translate-x-1/2 justify-center ${
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
            className="pointer-events-none absolute top-0 h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: colors.accent }}
          />
          <span
            className="pointer-events-none absolute bottom-0 top-[4px] w-px"
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
