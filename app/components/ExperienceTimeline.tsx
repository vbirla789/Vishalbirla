"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { colors } from "../theme";
import { playHover, playSelect } from "../lib/sound";
import { experience } from "../lib/experience";
import RichText from "./RichText";

const EASE = [0.22, 1, 0.36, 1] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 ease-out"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Six-point asterisk used as the bullet marker, in the accent colour. */
function Asterisk() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M11 2h2v20h-2z" />
      <path d="M2.7 6.5l1-1.7 17.6 10.2-1 1.7z" />
      <path d="M21.3 6.5l1 1.7L4.7 18.4l-1-1.7z" />
    </svg>
  );
}

export default function ExperienceTimeline() {
  // Accordion: one open at a time. The current role starts open.
  const [openId, setOpenId] = useState<string | null>(
    experience.find((e) => e.current)?.company ?? null,
  );

  return (
    <div className="relative">
      {experience.map((e, i) => {
        const id = e.company;
        const isOpen = openId === id;
        const expandable = Boolean(e.bullets?.length);
        const isLast = i === experience.length - 1;

        return (
          <div key={id} className="relative">
            {/* connector: runs from this logo down to the next one. Sits behind
                the row so the hover highlight doesn't cover it. */}
            {/* Geometry, measured rather than guessed: the button is px-3/py-3
                and the logo is 44px, so the logo centre is at x=34 and its
                bottom at y=56. -bottom-3 bridges the next row's top padding so
                the line meets the next logo instead of stopping 12px short. */}
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-[34px] top-[58px] w-px"
                style={{ background: colors.line }}
              />
            ) : null}

            <div className="group relative rounded-2xl transition-colors duration-200 hover:bg-[color:var(--c-tab-active-bg)]">
              <button
                type="button"
                onClick={() => {
                  if (!expandable) return;
                  playSelect();
                  setOpenId(isOpen ? null : id);
                }}
                onMouseEnter={playHover}
                aria-expanded={expandable ? isOpen : undefined}
                aria-controls={expandable ? `exp-${id}` : undefined}
                className={`flex w-full items-start gap-4 px-3 py-3 text-left outline-none ${
                  expandable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* logo + live dot */}
                <span className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.logo}
                    alt={`${e.company} logo`}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-[12px] object-cover ring-1 ring-black/5 dark:ring-[color:var(--c-line)]"
                  />
                  {e.current ? (
                    <span
                      aria-label="Current role"
                      className="absolute -right-px -top-px h-[7px] w-[7px] rounded-full"
                      style={{ background: "#22c55e", boxShadow: `0 0 0 1.5px ${colors.background}` }}
                    />
                  ) : null}
                </span>

                {/* company + role */}
                <span className="min-w-0 flex-1 pt-0.5">
                  <span
                    className="block truncate"
                    style={{ fontSize: 17, fontWeight: 500, color: colors.primary }}
                  >
                    {e.company}
                  </span>
                  <span className="mt-0.5 block truncate" style={{ fontSize: 14, color: colors.secondary }}>
                    {e.role}
                  </span>
                </span>

                {/* period + chevron */}
                <span className="flex shrink-0 items-center gap-2 pt-1">
                  <span
                    className="hidden whitespace-nowrap font-mono sm:inline"
                    style={{ fontSize: 13, color: colors.tertiary }}
                  >
                    {e.period}
                  </span>
                  {expandable ? (
                    <span
                      className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ color: colors.tertiary, opacity: isOpen ? 1 : undefined }}
                    >
                      <Chevron open={isOpen} />
                    </span>
                  ) : null}
                </span>
              </button>

              {/* expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && expandable ? (
                  <motion.div
                    id={`exp-${id}`}
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 pl-[60px] pr-3 pt-0.5">
                      {e.bullets?.length ? (
                        <ul className="flex flex-col gap-2">
                          {e.bullets.map((b) => (
                            <li key={b} className="flex gap-2.5">
                              <span className="mt-[5px]" style={{ color: colors.accent }}>
                                <Asterisk />
                              </span>
                              <span
                                className="max-w-[560px]"
                                style={{ fontSize: 14, lineHeight: 1.55, color: colors.secondary }}
                              >
                                <RichText text={b} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {/* mobile: period lives here, since the row hides it */}
                      <p className="mt-3 font-mono sm:hidden" style={{ fontSize: 12, color: colors.tertiary }}>
                        {e.period}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
