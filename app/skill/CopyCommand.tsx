"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";

/* The install command in a hairline box, with a copy button that swaps to a
   tick for a moment. The command is real text, so it can also be selected. */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // Clipboard API blocked (insecure context, permissions, embedded
      // browsers): fall back to a selected textarea + execCommand.
      const ta = document.createElement("textarea");
      ta.value = command;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) return; // nothing worked: the text is still selectable by hand
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const [bin, ...rest] = command.split(" ");

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[10px] py-2.5 pl-4 pr-2"
      style={{ boxShadow: `inset 0 0 0 1px ${colors.line}`, backgroundColor: colors.panel }}
    >
      {/* On a phone the command is wider than the box: it scrolls sideways
          with no scrollbar, and the right edge fades to say there's more. */}
      <code className="min-w-0 overflow-x-auto whitespace-nowrap font-mono text-[13px] leading-5 [mask-image:linear-gradient(to_right,#000_85%,transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
        <span style={{ color: colors.accent }}>{bin}</span>{" "}
        <span style={{ color: colors.primary }}>{rest.join(" ")}</span>
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-[color:var(--c-btn-muted-bg-hover)] active:scale-[0.92]"
        style={{ color: copied ? colors.primary : colors.tertiary }}
      >
        <span className="relative h-4 w-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="absolute inset-0 transition-[opacity,transform] duration-200 ease-out"
            style={{ opacity: copied ? 0 : 1, transform: copied ? "scale(0.6)" : "scale(1)" }}
          >
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </svg>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="absolute inset-0 transition-[opacity,transform] duration-200 ease-out"
            style={{ opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.6)" }}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </button>
    </div>
  );
}
