"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { colors } from "../theme";
import { playHover } from "../lib/sound";
import { SparkleIcon } from "./HeaderNav";

/* Starter prompts, drawn from what the portfolio actually covers. */
const SUGGESTIONS = [
  "What's your strongest project?",
  "Tell me about the noon review flow",
  "Can you tell me more about yourself?",
  "What's your design + code background?",
];

export default function AskAiPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // focus the input once the panel has slid in
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(id);
  }, [open]);

  const pick = (q: string) => {
    playHover();
    setValue(q);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* scrim */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Ask AI about Vishal"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[420px] flex-col border-l"
            style={{ backgroundColor: colors.panel, borderColor: colors.line }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* ---- header ---- */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  onMouseEnter={playHover}
                  aria-label="Close panel"
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-black/[0.06]"
                  style={{ color: colors.secondary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 8l4 4-4 4" />
                  </svg>
                </button>
                <span className="text-[14px] font-medium" style={{ color: colors.primary }}>
                  Ask Vishal
                </span>
              </div>

              <span
                aria-hidden="true"
                title="Answers are generated — verify anything important."
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                style={{ color: colors.tertiary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
              >
                i
              </span>
            </div>

            {/* ---- body: bottom-aligned, like the reference ---- */}
            <div className="flex flex-1 flex-col justify-end overflow-y-auto px-6 pb-4">
              <h2
                className="text-[26px] font-medium tracking-[-0.02em]"
                style={{ color: colors.primary }}
              >
                Ask me anything.
              </h2>

              <ul className="mt-5 flex flex-col gap-2.5">
                {SUGGESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => pick(q)}
                      onMouseEnter={playHover}
                      className="group flex w-full items-start gap-2.5 text-left text-[14px] leading-snug outline-none"
                      style={{ color: colors.secondary }}
                    >
                      <span className="mt-[2px] shrink-0" style={{ color: colors.accent }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 10l5 5-5 5" />
                          <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                        </svg>
                      </span>
                      <span className="transition-colors group-hover:text-[color:var(--c-primary)]">{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- composer ---- */}
            <div className="px-4 pb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: no model wired up yet — this panel is a UI shell.
                  // Post `value` to an /api/ask route and stream the reply here.
                }}
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: colors.surface,
                  boxShadow: `inset 0 0 0 1px ${colors.line}`,
                }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ask about Vishal..."
                  className="max-h-28 w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[color:var(--c-tab-inactive)]"
                  style={{ color: colors.primary }}
                />

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: colors.tabActiveBg, color: colors.accent }}
                    >
                      <SparkleIcon size={13} />
                    </span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: colors.tabActiveBg, color: colors.secondary }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                      </svg>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!value.trim()}
                    onMouseEnter={playHover}
                    aria-label="Send"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-opacity disabled:opacity-35"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 19V5" />
                      <path d="M5 12l7-7 7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
