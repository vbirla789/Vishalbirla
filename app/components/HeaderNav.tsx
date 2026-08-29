"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";
import AskAiPanel from "./AskAiPanel";
import ThemeToggle from "./ThemeToggle";
import SlidingTabs from "./SlidingTabs";

/* Section ids must match the ones rendered in page.tsx / WorkSection.tsx. */
const items: { id: string; label: string }[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "fun", label: "Concepts" },
];

function InboxIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

/** Four-point sparkle. Orange, per the accent token. */
export function SparkleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 2.5l1.9 6.1a1 1 0 0 0 .65.66L20.5 11l-6.05 1.74a1 1 0 0 0-.65.66L12 19.5l-1.9-6.1a1 1 0 0 0-.65-.66L3.5 11l6.05-1.74a1 1 0 0 0 .65-.66L12 2.5z" />
      <path d="M19 3l.6 1.9L21.5 5.5 19.6 6.1 19 8l-.6-1.9-1.9-.6 1.9-.6L19 3z" opacity="0.75" />
    </svg>
  );
}

export default function HeaderNav() {
  const [active, setActive] = useState("about");
  const [askOpen, setAskOpen] = useState(false);
  // while true, ignore scroll-spy so a click's chosen section stays active mid-scroll
  const lockRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<string | null>(null); // for the per-section scroll tick

  // Unlock audio on first gesture. This moved here from SideNav — without it
  // the whole site is silent, since nothing else primes the AudioContext.
  useEffect(() => {
    preloadAudio();
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  // scroll-spy: whichever section crosses the viewport middle becomes active,
  // and play one tick each time a new section is entered (both ways)
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
          if (lastActiveRef.current !== null) playScroll();
          lastActiveRef.current = id;
        }
        setActive(id);
      },
      // Detection band sits in the upper third of the viewport, not the middle.
      // With the timeline hidden, #about no longer reaches the vertical centre
      // at scroll 0, so a centred band highlighted "Work" on first load.
      { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // The last section can never win the band: the page runs out of scroll before
  // #fun dominates it, so "Concepts" would never light up on the way down.
  // Force it once the page is scrolled to the bottom.
  useEffect(() => {
    const onScroll = () => {
      if (lockRef.current) return;
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      if (atBottom) {
        const last = items[items.length - 1].id;
        lastActiveRef.current = last;
        setActive(last);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    playHover();
    setActive(id);
    lastActiveRef.current = id;
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    lockTimer.current = setTimeout(() => {
      lockRef.current = false;
    }, 800);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--c-background) 82%, transparent)" }}
      >
        <div className="mx-auto flex w-full max-w-[800px] items-center justify-between gap-3 px-6 pb-3.5 pt-6">
          {/* segmented section nav — sliding pill */}
          <SlidingTabs
            ariaLabel="Section navigation"
            tabs={items.map((it) => ({
              id: it.id,
              label: it.label,
              icon: active === it.id ? <InboxIcon /> : null,
            }))}
            activeId={active}
            onSelect={go}
            onTabHover={playHover}
          />

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />

            {/* Ask AI */}
            <button
              type="button"
              onClick={() => {
                playHover();
                setAskOpen(true);
              }}
              onMouseEnter={playHover}
              aria-haspopup="dialog"
              aria-expanded={askOpen}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium leading-none outline-none transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.07]"
              style={{ color: colors.tabActive }}
            >
              <span style={{ color: colors.accent }}>
                <SparkleIcon />
              </span>
              Ask AI
            </button>
          </div>
        </div>
      </header>

      <AskAiPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </>
  );
}
