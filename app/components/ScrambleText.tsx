"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
 * Scramble / decode text.
 * On hover (or focus), every character rapidly flickers through random glyphs
 * and then settles into the final text, resolving left-to-right.
 * A hidden sizer holds the layout so the line never reflows while animating.
 * Respects prefers-reduced-motion.
 * --------------------------------------------------------------------------*/

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_/[]{}=+*^?#&%$";

// Frame-based timing (~60fps): tuned to feel snappy (~0.6s for a short name).
const REVEAL_START = 5; // frames before the first character settles
const STEP = 2.2; // frames between each character settling (left → right)
const SPREAD = 6; // random extra frames per character

type Props = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
};

export default function ScrambleText({ text, className, style, as }: Props) {
  const Tag = (as ?? "span") as React.ElementType;
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    stop();
    const queue = Array.from(text).map((char, i) => ({
      char,
      space: char === " ",
      end: REVEAL_START + i * STEP + Math.random() * SPREAD,
    }));

    let frame = 0;
    const tick = () => {
      let out = "";
      let done = 0;
      for (const q of queue) {
        if (q.space) {
          out += " ";
          done++;
        } else if (frame >= q.end) {
          out += q.char;
          done++;
        } else {
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      setDisplay(out);
      if (done === queue.length) {
        setDisplay(text);
        rafRef.current = null;
        return;
      }
      frame++;
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [text, stop]);

  useEffect(() => stop, [stop]);

  return (
    <Tag
      className={className}
      style={{ position: "relative", display: "inline-block", ...style }}
      onMouseEnter={run}
      onFocus={run}
      aria-label={text}
    >
      {/* sizer — reserves the line so the layout never shifts */}
      <span aria-hidden className="invisible">
        {text}
      </span>
      {/* animated glyphs, overlaid and left-aligned */}
      <span
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0, whiteSpace: "pre" }}
      >
        {display}
      </span>
    </Tag>
  );
}
