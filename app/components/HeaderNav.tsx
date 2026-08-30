"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";
import AskAiPanel from "./AskAiPanel";
import ThemeToggle from "./ThemeToggle";
import SlidingTabs from "./SlidingTabs";

/** Shared wrapper so every nav glyph is identical in size and stroke. */
function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

/* Section ids must match the ones rendered in page.tsx / WorkSection.tsx.
   Each section gets its own glyph, and the icon renders on every tab — not
   only the active one. Showing it conditionally changed the active tab's
   width mid-slide, which is what made the pill stutter between sections. */
const items: { id: string; label: string; icon: React.ReactNode }[] = [
  {
    id: "about",
    label: "About",
    // person
    icon: (
      <NavIcon>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </NavIcon>
    ),
  },
  {
    id: "work",
    label: "Work",
    // briefcase
    icon: (
      <NavIcon>
        <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
        <path d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7" />
        <path d="M2.5 12.5h19" />
      </NavIcon>
    ),
  },
  {
    id: "experience",
    label: "Experience",
    // building
    icon: (
      <NavIcon>
        <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21" />
        <path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21" />
        <path d="M2.5 21h19" />
        <path d="M7.5 8.5h3M7.5 12.5h3M7.5 16.5h3" />
      </NavIcon>
    ),
  },
  {
    id: "fun",
    label: "Concepts",
    // flask / experiment
    icon: (
      <NavIcon>
        <path d="M9 3h6" />
        <path d="M10 3v5.5L5.5 17A2.5 2.5 0 0 0 7.8 21h8.4a2.5 2.5 0 0 0 2.3-4L14 8.5V3" />
        <path d="M7.2 14.5h9.6" />
      </NavIcon>
    ),
  },
];

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

  /* Honour the hash on mount. The back button on a case study links to
     "/#work", but if the homepage URL already carries that hash the browser
     treats it as a same-hash no-op and never scrolls — so "back" appeared to
     do nothing. Doing it here also makes deep links (/#experience) work, and
     tolerates a doubled hash like "#work#work". */
  useEffect(() => {
    const raw = window.location.hash.replace(/^#+/, "");
    const id = raw.split("#").filter(Boolean).pop();
    if (!id || !items.some((it) => it.id === id)) return;

    // Hold off scroll-spy while we jump: the observer's first callback fires at
    // scroll 0, where #about owns the band, and would otherwise clobber the
    // active tab we're about to set.
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      lockRef.current = false;
    }, 900);

    // A timer, not requestAnimationFrame: rAF doesn't fire in a background or
    // throttled tab, which would silently skip the jump. The short delay lets
    // layout and the webfonts settle so the target offset is correct.
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "auto", block: "start" });
      lastActiveRef.current = id;
      setActive(id);
    }, 60);

    return () => clearTimeout(timer);
  }, []);

  /* Scroll-spy, computed directly from scroll position.
   *
   * This deliberately does NOT use IntersectionObserver. An observer only
   * fires when a threshold is crossed, and #work is ~1400px tall: once it
   * fully covered the detection band its ratio stayed pinned at 1, no
   * threshold was crossed, and the nav froze on "Work" for the rest of the
   * page — Experience and Concepts never activated.
   *
   * Reading positions on scroll is O(sections) and always correct: the active
   * section is the last one whose top has passed a line just below the header.
   */
  useEffect(() => {
    /* The activation line, measured from the viewport top. Viewport-relative
     * rather than a fixed offset: #work is ~1750px tall while Experience and
     * Concepts are short and sit at the end of the page. With a line just
     * under the header, Concepts' top never reached it before the page ran out
     * of scroll, so it could only ever activate via the bottom guard. At ~35%
     * down, every section gets a real window. */
    const line = () => Math.max(120, window.innerHeight * 0.35);

    const pick = () => {
      const LINE = line();
      if (lockRef.current) return; // a click is driving the scroll

      let current = items[0].id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= LINE) current = it.id;
      }

      // At the very bottom the last section may never cross the line, so claim
      // it explicitly rather than leaving the previous one lit.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        current = items[items.length - 1].id;
      }

      if (current !== lastActiveRef.current) {
        if (lastActiveRef.current !== null) playScroll(); // tick per section
        lastActiveRef.current = current;
        setActive(current);
      }
    };

    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    pick();

    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
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
              // Active tab only — the pill re-measures after React commits, so
              // the width change is part of the same 250ms tween.
              icon: active === it.id ? it.icon : null,
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
