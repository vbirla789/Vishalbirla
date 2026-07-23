"use client";

import { colors } from "../theme";
import type { MediaKind } from "../lib/projects";
import { Zoomable } from "./MediaViewer";

/* ----------------------------------------------------------------------------
 * Dummy visual placeholders for case-study sections. No real assets — abstract
 * device frames and panels that read as product screenshots.
 * --------------------------------------------------------------------------*/

/** A stylized phone frame with an abstract app screen inside. */
function Phone({ scheme = "light" }: { scheme?: "light" | "dark" }) {
  const dark = scheme === "dark";
  return (
    <div
      className="relative rounded-[26px] p-2 shadow-sm"
      style={{
        width: 190,
        background: dark ? "#111114" : "#ffffff",
        border: `1px solid ${dark ? "#26262b" : colors.line}`,
      }}
    >
      {/* notch */}
      <div
        className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full"
        style={{ background: dark ? "#26262b" : "#e7e5e4" }}
      />
      <div
        className="overflow-hidden rounded-[18px] px-3 pb-4 pt-7"
        style={{ background: dark ? "#0b0b0e" : "#fafaf9", height: 360 }}
      >
        {/* abstract balance */}
        <div
          className="mx-auto mb-4 h-2 w-24 rounded-full"
          style={{ background: dark ? "#26262b" : "#e7e5e4" }}
        />
        <div
          className="mx-auto mb-6 h-5 w-40 rounded-md"
          style={{ background: dark ? "#33333a" : "#d6d3d1" }}
        />
        {/* stacked cards */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="mb-3 rounded-xl p-3"
            style={{
              background: [
                "linear-gradient(135deg,#7c5cff,#a78bfa)",
                "linear-gradient(135deg,#f97316,#fb923c)",
                "linear-gradient(135deg,#0ea5e9,#38bdf8)",
              ][i],
              opacity: 1 - i * 0.12,
            }}
          >
            <div className="mb-2 h-1.5 w-10 rounded-full bg-white/50" />
            <div className="h-3 w-20 rounded bg-white/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A soft grey stage that centers a piece of media (matches the reference). */
function Stage({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl px-6 py-12"
      style={{
        background: tone === "dark" ? "#0b0b0e" : "#f4f4f5",
      }}
    >
      {children}
    </div>
  );
}

/** Abstract line chart on a card — for outcome / analytics moments. */
function Chart() {
  return (
    <div className="w-full max-w-[420px] rounded-xl bg-white p-5 ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Adoption
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
          +14%
        </span>
      </div>
      <svg viewBox="0 0 260 90" className="h-24 w-full">
        <defs>
          <linearGradient id="cmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 74 L40 66 L80 68 L120 50 L160 54 L200 34 L260 12"
          fill="none"
          stroke="#7c5cff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 74 L40 66 L80 68 L120 50 L160 54 L200 34 L260 12 L260 90 L0 90 Z"
          fill="url(#cmFill)"
        />
      </svg>
    </div>
  );
}

/** Two grayscale photo placeholders side by side. */
function Photos() {
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex aspect-[4/3] items-center justify-center rounded-xl"
          style={{
            background:
              "linear-gradient(135deg,#3f3f46,#52525b 55%,#71717a)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m21 17-5-5L5 19" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** A real screenshot rendered full-width (assets already ship with their own frame/bg). */
function ImageFrame({
  src,
  alt,
  zoomable = true,
  large = false,
}: {
  src: string;
  alt: string;
  zoomable?: boolean;
  large?: boolean;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={
        large
          ? "mx-auto max-h-[62vh] w-auto rounded-2xl ring-1 ring-black/5"
          : "w-full rounded-2xl ring-1 ring-black/5"
      }
      loading="lazy"
    />
  );
  if (!zoomable) return img;
  return (
    <Zoomable label={alt} className="rounded-2xl">
      {img}
    </Zoomable>
  );
}

/**
 * Media chooser for a case-study slot: renders a grid of real images, a single
 * real image, or an abstract placeholder — in that order of preference.
 */
export function CaseMedia({
  image,
  images,
  media,
  video,
  placeholder,
  alt = "Project screenshot",
  zoomable = true,
  large = false,
}: {
  image?: string;
  images?: string[];
  media?: MediaKind;
  video?: string;
  placeholder?: string;
  alt?: string;
  zoomable?: boolean;
  large?: boolean;
}) {
  if (video) {
    const stageClass = large
      ? "flex w-[min(1040px,88vw)] items-center justify-center rounded-2xl bg-zinc-100 px-6 py-14"
      : "flex items-center justify-center rounded-2xl bg-zinc-100 px-6 py-12";
    const stage = (
      <div className="overflow-hidden rounded-[26px]">
        <video
          className={large ? "block h-[62vh] w-auto object-contain" : "block h-[440px] w-auto object-contain"}
          src={video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      </div>
    );
    if (!zoomable) {
      return <div className={stageClass}>{stage}</div>;
    }
    return (
      <Zoomable label={alt} className={stageClass}>
        {stage}
      </Zoomable>
    );
  }
  if (images && images.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {images.map((src, i) => (
          <ImageFrame key={src} src={src} alt={`${alt} ${i + 1}`} zoomable={zoomable} large={large} />
        ))}
      </div>
    );
  }
  if (image) return <ImageFrame src={image} alt={alt} zoomable={zoomable} large={large} />;
  if (media) return <Media kind={media} />;
  if (placeholder) {
    return (
      <div
        className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center"
        style={{ borderColor: "#d6d3d1", background: "#fafaf9" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.6" />
          <path d="m21 16-4.5-4.5L7 21" />
        </svg>
        <span className="max-w-[320px] text-[13px] leading-snug" style={{ color: colors.tertiary }}>
          {placeholder}
        </span>
      </div>
    );
  }
  return null;
}

export function Media({ kind }: { kind: MediaKind }) {
  switch (kind) {
    case "phone":
      return (
        <Stage>
          <Phone />
        </Stage>
      );
    case "panel":
      return (
        <Stage>
          <Chart />
        </Stage>
      );
    case "chart":
      return (
        <Stage>
          <Chart />
        </Stage>
      );
    case "duo":
      return (
        <Stage tone="dark">
          <div className="flex items-end gap-5">
            <Phone scheme="dark" />
            <Phone scheme="dark" />
          </div>
        </Stage>
      );
    case "photos":
      return <Photos />;
    default:
      return null;
  }
}
