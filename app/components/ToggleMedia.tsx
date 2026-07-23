"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, useState } from "react";
import { CaseMedia } from "./caseMedia";
import { useMediaViewer } from "./MediaViewer";
import type { StoryMedia } from "../lib/projects";
import { colors } from "../theme";

const EASE = [0.22, 1, 0.36, 1] as const;

export type ToggleOption = { label: string; media: StoryMedia };

/**
 * A media slot with a segmented toggle above it (Before/After, AI/Manual, …).
 * Sliding pill + crossfade between states. Clicking the media enlarges the whole
 * block — toggle included — in the lightbox, so states can still be switched.
 *
 * `enlargeable` is turned off for the copy rendered inside the overlay (so it
 * doesn't open another overlay); the toggle there still works.
 */
export default function ToggleMedia({
  options,
  alt,
  enlargeable = true,
  defaultIndex = 0,
}: {
  options: ToggleOption[];
  alt: string;
  enlargeable?: boolean;
  defaultIndex?: number;
}) {
  const [idx, setIdx] = useState(defaultIndex);
  const pillId = useId();
  const { open } = useMediaViewer();
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options[idx]?.media;

  if (!active) return null;

  const openOverlay = () => {
    open({
      fit: false,
      node: (
        <ToggleMedia
          options={options}
          alt={alt}
          enlargeable={false}
          defaultIndex={idx}
        />
      ),
    });
  };

  return (
    <div ref={rootRef} className={enlargeable ? undefined : "flex flex-col items-center"}>
      <div className="mb-5 inline-flex rounded-full bg-zinc-100 p-1">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={idx === i}
            className="relative rounded-full px-4 py-1.5 text-[13px] font-medium capitalize outline-none"
            style={{
              color: idx === i ? colors.primary : colors.tertiary,
              transition: "color 0.25s ease",
            }}
          >
            {idx === i ? (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{o.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          {...(enlargeable
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": `Enlarge ${alt}`,
                onClick: openOverlay,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openOverlay();
                  }
                },
                className: "cursor-pointer outline-none",
              }
            : {})}
        >
          <CaseMedia
            zoomable={false}
            large={!enlargeable}
            image={active.image}
            images={active.images}
            video={active.video}
            media={active.media}
            placeholder={active.placeholder}
            alt={`${alt} — ${options[idx].label}`}
          />
          {active.caption ? (
            <p
              className="mt-3 text-center text-[13px]"
              style={{ color: colors.tertiary }}
            >
              {active.caption}
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
