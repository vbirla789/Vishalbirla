"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { playHover, playScroll, preloadAudio, primeAudio } from "../lib/sound";

type NavItem = { id: string; label: string };

const DEFAULT_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "outcomes", label: "Outcomes" },
  { id: "solution", label: "Solution" },
  { id: "experiments", label: "AI Experiments" },
  { id: "process", label: "Process" },
];

export default function CaseStudyNav({ items = DEFAULT_ITEMS }: { items?: NavItem[] }) {
  const [active, setActive] = useState("overview");
  // only show nav items whose section actually exists on the page
  const [shown, setShown] = useState(items);
  // while true, ignore scroll-spy so a click's chosen section stays active mid-scroll
  const lockRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<string | null>(null); // for the per-section scroll tick

  useEffect(() => {
    setShown(items.filter((it) => document.getElementById(it.id)));
  }, [items]);

  useEffect(() => {
    preloadAudio(); // build the audio graph up-front
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

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
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

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
      className="fixed left-8 top-1/2 z-50 hidden -translate-y-1/2 min-[1200px]:block"
      style={cssVars}
      aria-label="Case study navigation"
    >
      <ul className="flex flex-col gap-2.5">
        {shown.flatMap((it, i) => {
          const isActive = active === it.id;
          const rows = [];

          // two minor ticks between items (ruler aesthetic — matches home nav)
          if (i > 0) {
            rows.push(minorTick(`m1-${it.id}`), minorTick(`m2-${it.id}`));
          }

          rows.push(
            <li key={it.id}>
              <button
                type="button"
                onClick={() => go(it.id)}
                onMouseEnter={playHover}
                className="group/item flex items-center gap-3.5 outline-none"
                aria-current={isActive ? "true" : undefined}
              >
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
              </button>
            </li>,
          );

          return rows;
        })}
      </ul>
    </nav>
  );
}
