"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { colors } from "../theme";
import { playHover } from "../lib/sound";

/** Applied before paint by the inline script in layout.tsx — see THEME_INIT. */
export const THEME_KEY = "theme";

/** Not in TS's DOM lib yet — Chrome/Edge/Safari 18 ship it, Firefox doesn't. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

const REVEAL_MS = 500;

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function ThemeToggle() {
  // `null` until mounted so the icon never renders the wrong state during
  // hydration — the class on <html> is the source of truth.
  const [isDark, setIsDark] = useState<boolean | null>(null);
  /** Origin of the reveal circle. */
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Reading the class that the pre-hydration script in layout.tsx already
    // applied — i.e. syncing React from an external system, which is what
    // effects are for. It can't be lazy state: the server has no <html> class
    // to read, so initialising from the DOM would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = async () => {
    playHover();
    const next = !document.documentElement.classList.contains("dark");

    const apply = () => {
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        /* private mode — the choice just won't persist */
      }
      setIsDark(next);
    };

    const doc = document as ViewTransitionDocument;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fall back to a plain swap where the API is missing (Firefox) or motion
    // is unwelcome. The theme still changes — only the reveal is skipped.
    if (!btnRef.current || !doc.startViewTransition || reduced) {
      apply();
      return;
    }

    /* flushSync is load-bearing: startViewTransition snapshots the DOM when
       the callback returns, so React's normally-async state update has to be
       committed synchronously or the snapshot catches the old theme. */
    await doc.startViewTransition(() => {
      flushSync(apply);
    }).ready;

    // Circle grows from the toggle's centre to whichever corner is furthest,
    // so the reveal always covers the viewport.
    const { top, left, width, height } = btnRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: REVEAL_MS,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark ?? false}
      /* Sized to match the nav bar exactly: 40px on phones (32px tab + 4px bar
         padding each side), 36px from sm up (30px tab + 3px each side). */
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] outline-none transition-colors duration-200 sm:h-9 sm:w-9 sm:rounded-[10px]"
      style={{ backgroundColor: colors.tabActiveBg, color: colors.secondary }}
    >
      {/* Render nothing until mounted, so SSR and client agree. */}
      {isDark === null ? null : isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
