"use client";

import { useEffect, useState } from "react";
import { colors } from "../theme";

/**
 * Where he is and what time it is there, for the right end of the nav.
 *
 * Always Asia/Kolkata, never the visitor's clock — the point is to say where
 * *he* is, so someone reading this at 3am in California should still see his
 * afternoon.
 *
 * The time is filled in after mount rather than rendered on the server. The
 * server's clock and the browser's are seconds apart, which React reports as a
 * hydration mismatch, and a portfolio is cached besides — a server-rendered
 * time would be frozen at build. The slot holds its width while empty so
 * nothing shifts when the digits arrive.
 */
const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    /* 30s, not 60s: on a minute-long interval the displayed minute can sit up
       to 59 seconds stale, which is visible if you happen to be watching. */
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    /* hidden below sm: the tabs pill alone takes 283 of a 375px bar, so the
       clock was left flush against the screen edge with no gutter. The AI
       glasses toggle beside it is hidden at the same breakpoint, for the same
       reason. */
    <div
      className="hidden shrink-0 items-center gap-2 font-mono text-[12px] leading-none sm:flex"
      style={{ color: colors.tertiary }}
    >
      <span>Bangalore</span>
      <span
        className="tabular-nums"
        style={{ color: colors.secondary, minWidth: "5ch" }}
      >
        {time ?? ""}
      </span>
    </div>
  );
}
