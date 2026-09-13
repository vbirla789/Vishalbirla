"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
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

/* Resting tilt per card, so the row reads as scattered prints rather than a
   grid. Static now: these used to straighten as a dragged playhead passed
   over them, which is gone along with the clock. */
const rotations = [-6, 3, -3, 5, -4];

/* Horizontal centre of each card, as a % across the panel. */
const centers = photoSrcs.map(
  (_, i) => 12 + (i * (88 - 12)) / (photoSrcs.length - 1),
);

export default function PhotoStrip() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="w-[376px] max-w-full select-none">
      <div className="relative h-[80px]">
        <div
          className="grid-bg absolute inset-0 rounded-[2px] border"
          style={{ backgroundColor: colors.panel, borderColor: colors.line }}
        />

        {photoSrcs.map((src, i) => (
          <div
            key={src}
            className="absolute top-1/2"
            style={{
              left: `${centers[i]}%`,
              /* One transform, not a motion animation: with the drag gone
                 nothing changes these at runtime, so the cards no longer need
                 a spring driving them every frame. */
              transform: `translate(-50%, -50%) rotate(${rotations[i]}deg)`,
              zIndex: 10 + i,
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label="Open photo"
              className="group block cursor-pointer rounded-[2px] border px-[3px] pb-[7px] pt-[3px] outline-none transition-shadow hover:shadow-sm"
              style={{ backgroundColor: colors.panel, borderColor: colors.line }}
            >
              <div className="relative h-[56px] w-[52px] overflow-hidden rounded-[2px]">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="72px"
                  quality={90}
                  priority
                  /* Grey at rest, true colour on hover — the same treatment
                     the About portrait used, so the page has one idea about
                     how photographs behave. */
                  className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                />
              </div>
            </button>
          </div>
        ))}
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
