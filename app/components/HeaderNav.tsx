"use client";

import { useEffect, useRef, useState } from "react";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";
import { NerdModeToggle } from "./NerdMode";

/* Section ids must match the ones rendered in page.tsx / WorkSection.tsx.
   Labels only — the per-section glyphs went with the sliding pill, which was
   the only thing that drew them. */
const items: { id: string; label: string }[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "fun", label: "Concepts" },
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
          {/* Plain text links, no pill and no icons. The active section is
              marked by colour alone — with nothing sliding behind them the
              labels can't shift as the active one changes, which is what the
              pill had to re-measure around. */}
          <nav
            aria-label="Section navigation"
            className="flex items-center gap-5 sm:gap-7"
          >
            {items.map((it) => {
              const isActive = active === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => go(it.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 font-mono text-[14px] uppercase leading-none outline-none transition-colors duration-200 ${
                    isActive
                      ? "text-[color:var(--c-tab-active)]"
                      : "text-[color:var(--c-tab-inactive)] hover:text-[color:var(--c-tab-inactive-hover)]"
                  }`}
                >
                  {it.label}
                </button>
              );
            })}
          </nav>

          {/* Right end: AI glasses only. State comes from NerdModeProvider in
              the layout via context. */}
          <div className="flex shrink-0 items-center gap-1.5">
            <NerdModeToggle />
          </div>
        </div>
      </header>

    </>
  );
}
