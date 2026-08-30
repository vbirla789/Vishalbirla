"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { colors } from "../theme";
import { playHover, playSuccess } from "../lib/sound";
import { SparkleIcon } from "./HeaderNav";
import Link from "next/link";
import { answerAbout, type AnswerLink } from "../lib/askContext";

type Turn = { role: "user" | "assistant"; text: string; links?: AnswerLink[] };

/* Starter prompts, drawn from what the knowledge base actually covers. */
const SUGGESTIONS = [
  "What's your strongest project?",
  "Tell me about the noon review flow",
  "Can you tell me more about yourself?",
  "What's your design + code background?",
];

/**
 * A link offered under an answer.
 *
 * "#section" links can't be plain anchors: the panel sits over the homepage,
 * so we close it first and then scroll, otherwise the jump happens behind the
 * open panel. Everything else is a real link — next/link for internal routes
 * so navigation stays client-side, a plain anchor for mailto/external.
 */
function AnswerChip({ link, onNavigate }: { link: AnswerLink; onNavigate: () => void }) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors";
  const style = {
    backgroundColor: colors.tabActiveBg,
    color: colors.primary,
    boxShadow: `inset 0 0 0 1px ${colors.line}`,
  } as React.CSSProperties;

  const arrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );

  if (link.href.startsWith("#")) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onMouseEnter={playHover}
        onClick={() => {
          onNavigate();
          const id = link.href.slice(1);
          // after the panel's exit transition, so the scroll is visible
          setTimeout(
            () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
            280,
          );
        }}
      >
        {link.label}
        {arrow}
      </button>
    );
  }

  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className} style={style} onMouseEnter={playHover} onClick={onNavigate}>
        {link.label}
        {arrow}
      </Link>
    );
  }

  return (
    <a href={link.href} className={className} style={style} onMouseEnter={playHover} onClick={onNavigate}>
      {link.label}
      {arrow}
    </a>
  );
}

const DISCLAIMER =
  "Answers come from a hand-written summary of my work, not a live model — so it can be incomplete or out of date. Check the project pages for the full story.";

export default function AskAiPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drives the page-shell scale-back in globals.css.
  useEffect(() => {
    document.documentElement.classList.toggle("ask-open", open);
    return () => document.documentElement.classList.remove("ask-open");
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 380);
    return () => clearTimeout(id);
  }, [open]);

  // keep the newest turn in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    setValue("");
    setTurns((t) => [...t, { role: "user", text: q }]);
    setThinking(true);
    // brief pause so the reply doesn't appear before the question has landed
    setTimeout(() => {
      const a = answerAbout(q);
      setTurns((t) => [...t, { role: "assistant", text: a.text, links: a.links }]);
      setThinking(false);
      playSuccess();
    }, 420);
  };

  // No document during SSR. Safe without a mounted flag: the portal only has
  // content while `open` is true, and open starts false, so server and first
  // client render agree.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          {/* click-anywhere-left to dismiss */}
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Ask Jarvis about Vishal"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[430px] flex-col"
            /* No radius here on purpose: the rounded corner belongs to
               #page-shell, so the page reads as a card lifted in front of a
               flush panel. Rounding both made two competing curves meet. */
            style={{ backgroundColor: colors.panel }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            {/* ---- header ---- */}
            <div className="flex shrink-0 items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  onMouseEnter={playHover}
                  aria-label="Close panel"
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[color:var(--c-tab-active-bg)]"
                  style={{ color: colors.secondary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 8l4 4-4 4" />
                  </svg>
                </button>
                <span className="text-[14px] font-medium" style={{ color: colors.primary }}>
                  Ask Jarvis
                </span>
              </div>

              {/* info + hover tooltip */}
              <div
                className="relative"
                onMouseEnter={() => setInfoOpen(true)}
                onMouseLeave={() => setInfoOpen(false)}
              >
                <button
                  type="button"
                  aria-label="About these answers"
                  onFocus={() => setInfoOpen(true)}
                  onBlur={() => setInfoOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] transition-colors hover:bg-[color:var(--c-tab-active-bg)]"
                  style={{ color: colors.tertiary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 11v6" />
                    <path d="M12 7.5v.01" />
                  </svg>
                </button>

                <AnimatePresence>
                  {infoOpen ? (
                    <motion.div
                      role="tooltip"
                      className="absolute right-0 top-9 z-10 w-[268px] rounded-2xl px-4 py-3 text-[13px] leading-snug"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.background,
                        boxShadow: "0 18px 40px -12px rgba(0,0,0,0.55)",
                      }}
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      {DISCLAIMER}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* ---- conversation ---- */}
            <div
              ref={scrollRef}
              className={`flex flex-1 flex-col overflow-y-auto px-6 pb-4 ${
                turns.length === 0 ? "justify-end" : "justify-start gap-4 pt-2"
              }`}
            >
              {turns.length === 0 ? (
                <>
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
                          onClick={() => ask(q)}
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
                          <span className="transition-colors group-hover:text-[color:var(--c-primary)]">
                            {q}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  {turns.map((t, i) =>
                    t.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <p
                          className="max-w-[85%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug"
                          style={{
                            backgroundColor: colors.btnSolidBg,
                            color: colors.btnSolidText,
                          }}
                        >
                          {t.text}
                        </p>
                      </div>
                    ) : (
                      <div key={i}>
                        <p
                          className="whitespace-pre-line text-[14px] leading-relaxed"
                          style={{ color: colors.secondary }}
                        >
                          {t.text}
                        </p>
                        {t.links?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {t.links.map((l) => (
                              <AnswerChip key={l.href + l.label} link={l} onNavigate={onClose} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ),
                  )}
                  {thinking ? (
                    <p className="text-[14px]" style={{ color: colors.tertiary }}>
                      Thinking…
                    </p>
                  ) : null}
                </>
              )}
            </div>

            {/* ---- composer ---- */}
            <div className="shrink-0 px-4 pb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(value);
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask(value);
                    }
                  }}
                  placeholder="Ask Jarvis about Vishal..."
                  className="max-h-28 w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[color:var(--c-tab-inactive)]"
                  style={{ color: colors.primary }}
                />

                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.tabActiveBg, color: colors.accent }}
                  >
                    <SparkleIcon size={13} />
                  </span>

                  <button
                    type="submit"
                    disabled={!value.trim()}
                    onMouseEnter={playHover}
                    aria-label="Send"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-opacity disabled:opacity-35"
                    style={{ backgroundColor: colors.accent, color: "#fff" }}
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
    </AnimatePresence>,
    document.body,
  );
}
