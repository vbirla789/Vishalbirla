"use client";

import Link from "next/link";
import { colors } from "../theme";
import { playHover } from "../lib/sound";

export default function BackButton() {
  return (
    <Link
      href="/#work"
      aria-label="Back to work"
      onMouseEnter={playHover}
      onClick={playHover}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 transition-colors hover:bg-zinc-200 dark:bg-[color:var(--c-panel)] dark:hover:bg-[color:var(--c-btn-muted-bg-hover)]"
      style={{ color: colors.secondary }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </Link>
  );
}
