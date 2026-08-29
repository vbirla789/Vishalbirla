"use client";

import { useEffect, useState } from "react";
import { colors } from "../theme";
import { playHover } from "../lib/sound";

/** Applied before paint by the inline script in layout.tsx — see THEME_INIT. */
export const THEME_KEY = "theme";

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

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    playHover();
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't persist */
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={playHover}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark ?? false}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] outline-none transition-colors duration-200"
      style={{ backgroundColor: colors.tabActiveBg, color: colors.secondary }}
    >
      {/* Render nothing until mounted, so SSR and client agree. */}
      {isDark === null ? null : isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
