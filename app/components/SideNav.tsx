"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";

// `href` items open in a new tab instead of scroll-spying to a section.
const RESUME_URL =
  "https://drive.google.com/file/d/1BYmEkLNnls8_dyRPnGYt1W6e2-sC950F/view?usp=sharing";

const items: { id: string; label: string; href?: string }[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "fun", label: "Concepts" },
  { id: "resume", label: "Resume", href: RESUME_URL },
];

export default function SideNav() {
  const [active, setActive] = useState("about");
  // while true, ignore scroll-spy so a click's chosen section stays active mid-scroll
  const lockRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<string | null>(null); // for the per-section scroll tick

  // unlock audio on first gesture
  useEffect(() => {
    preloadAudio(); // build the audio graph up-front
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  // scroll-spy: whichever section crosses the viewport middle becomes active,
  // and play one satisfying tick each time a new section is entered (both ways)
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return; // a click is driving the scroll — don't override
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const id = hit.target.id;
        if (id !== lastActiveRef.current) {
          if (lastActiveRef.current !== null) playScroll(); // tick per section, not on first
          lastActiveRef.current = id;
        }
        setActive(id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    playHover(); // subtle tick on click (was the loud playSelect knock)
    setActive(id); // activate the clicked section immediately
    lastActiveRef.current = id; // keep in sync so no stray tick when the lock releases
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    lockTimer.current = setTimeout(() => {
      lockRef.current = false;
    }, 800);
  };

  const cssVars = {
    "--c-primary": colors.primary,
    "--c-tertiary": colors.tertiary,
  } as React.CSSProperties;

  const minorTick = (key: string) => (
    <li key={key} aria-hidden className="pointer-events-none">
      <span className="block h-px w-[12px] bg-[var(--c-tertiary)] opacity-40" />
    </li>
  );

  return (
    <nav
      className="fixed left-7 top-1/2 z-50 hidden -translate-y-1/2 min-[1440px]:block"
      style={cssVars}
      aria-label="Section navigation"
    >
      <ul className="flex flex-col gap-2.5">
        {items.flatMap((it, i) => {
          const isActive = active === it.id;
          const rows = [];

          // two minor ticks between items (ruler aesthetic)
          if (i > 0) {
            rows.push(minorTick(`m1-${it.id}`), minorTick(`m2-${it.id}`));
          }

          const inner = (
            <>
              <span
                className={`block h-px shrink-0 transition-all duration-300 ease-out ${
                  isActive
                    ? "w-[44px] bg-[var(--c-primary)]"
                    : "w-[22px] bg-[var(--c-tertiary)] group-hover/item:w-[38px] group-hover/item:bg-[var(--c-primary)]"
                }`}
              />
              <span
                className={`whitespace-nowrap text-[13px] uppercase tracking-wide leading-none transition-colors duration-300 ease-out ${
                  isActive
                    ? "font-medium text-[var(--c-primary)]"
                    : "font-normal text-[var(--c-tertiary)] group-hover/item:text-[var(--c-primary)]"
                }`}
              >
                {it.label}
              </span>
            </>
          );

          rows.push(
            <li key={it.id}>
              {it.href ? (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={playHover}
                  onClick={playHover}
                  className="group/item flex items-center gap-3.5 outline-none"
                >
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => go(it.id)}
                  onMouseEnter={playHover}
                  className="group/item flex items-center gap-3.5 outline-none"
                  aria-current={isActive ? "true" : undefined}
                >
                  {inner}
                </button>
              )}
            </li>,
          );

          return rows;
        })}
      </ul>
    </nav>
  );
}
