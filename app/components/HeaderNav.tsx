"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";
import { NerdModeToggle } from "./NerdMode";
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

export default function HeaderNav() {
  const [active, setActive] = useState("about");
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
      /* "instant", not "auto". "auto" does not mean un-animated — it means
         defer to CSS, and html sets scroll-behavior: smooth. That turned this
         jump into a smooth animation which is cancelled during page load, so
         the back button from a case study landed on /#work and never moved.
         "instant" overrides the stylesheet. The nav's own click handler still
         uses "smooth" on purpose: by then the page has settled. */
      el.scrollIntoView({ behavior: "instant", block: "start" });
      lastActiveRef.current = id;
      setActive(id);

      /* Tidy the address bar. Arriving from a case study leaves "/#work#work"
         there — Next's Link appends to a hash the router has already applied.
         Parsing above copes with it, but the user can see it. replaceState
         rather than pushState so Back still returns to the case study, and it
         does not fire hashchange, so nothing re-runs. */
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, "", `${window.location.pathname}#${id}`);
      }
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
        /* sm:border-b — the hairline the vertical structure lines hang from,
           without which the section rules float unanchored. Gone on phones,
           where the whole grid is hidden (see SectionRule). */
        className="sticky top-0 z-50 w-full backdrop-blur-md sm:border-b"
        style={{
          backgroundColor: "color-mix(in srgb, var(--c-background) 82%, transparent)",
          borderColor: "var(--c-line)",
        }}
      >
        {/* Repaints the dithered backdrop over the header's own translucent
            background — see .dither--nav in globals.css for why it can't just
            show through. Sits behind the nav content. */}
        <div className="dither dither--nav" aria-hidden="true" />

        {/* Structure lines continued up through the navbar, so the grid runs
            unbroken from the top of the page. Mirrors the pair in page.tsx:
            same 840px column, same 24px gutter, same min-[888px] gate — keep
            all three in sync. Drawn here rather than behind the header
            because its 82%-opaque background would wash them out.
            z-[1] matches the nav content so they clear the dither layer. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] hidden w-full max-w-[840px] -translate-x-1/2 px-6 min-[888px]:block"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-[color:var(--c-line)]" />
          <div className="absolute inset-y-0 right-0 w-px bg-[color:var(--c-line)]" />
          {/* squares on the header's bottom hairline. -bottom-px centres them
              on the border, which sits just outside the padding box. */}
          <div className="absolute -bottom-px left-0 h-[5px] w-[5px] -translate-x-1/2 translate-y-1/2 bg-[color:var(--c-accent)]" />
          <div className="absolute -bottom-px right-0 h-[5px] w-[5px] translate-x-1/2 translate-y-1/2 bg-[color:var(--c-accent)]" />
        </div>
        {/* py-6, not pt-6 pb-3.5: the nav sat optically high in the bar now
            that a hairline closes it off underneath. */}
        <div className="relative z-[1] mx-auto flex w-full max-w-[840px] items-center justify-between gap-2 px-4 py-6 sm:gap-3 sm:px-6">
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
          />

          <div className="flex shrink-0 items-center gap-1.5">
            {/* AI glasses now lives here, where Ask Jarvis used to. State comes
                from NerdModeProvider in the layout via context. */}
            <NerdModeToggle />
          </div>
        </div>
      </header>

    </>
  );
}
