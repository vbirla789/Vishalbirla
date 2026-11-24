"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useIntroOpen } from "../lib/introGate";

/* ----------------------------------------------------------------------------
 * Appear — a smooth, one-time fade + rise reveal.
 * - Default: animates on mount (for above-the-fold content, sequenced by delay).
 * - inView: animates once when scrolled into view (for everything below the fold).
 * Never repeats.
 * --------------------------------------------------------------------------*/

const EASE = [0.22, 1, 0.36, 1] as const;

type AppearProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  inView?: boolean;
};

export default function Appear({
  children,
  delay = 0,
  y = 16,
  className,
  inView = false,
}: AppearProps) {
  const open = useIntroOpen();
  /* Held back by the intro? Then this reveal is the intro's last beat, and it
     materialises — settling out of a soft blur, a touch slower — so it reads
     as the page forming on the structure that just drew in. Read once, at
     mount: only what was waiting gets the treatment. Done as animate
     keyframes rather than a different `initial`, because `initial` is in the
     server markup and the server can't know about the intro. */
  const [fromIntro] = useState(() => !open);
  const ref = useRef<HTMLDivElement>(null);
  const transition = fromIntro
    ? { duration: 0.9, ease: EASE, delay }
    : { duration: 0.6, ease: EASE, delay };

  if (inView) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  /* On-mount reveals wait for the intro loader (see lib/introGate): played
     behind it, they would be over before the page was ever visible. */
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={
        !open
          ? { opacity: 0, y }
          : fromIntro
            ? { opacity: 1, y: 0, filter: ["blur(10px)", "blur(0px)"] }
            : { opacity: 1, y: 0 }
      }
      transition={transition}
      /* Even blur(0px) turns the box into a containing block for anything
         position:fixed inside it, so clear the filter once it has settled. */
      onAnimationComplete={() => {
        if (fromIntro && open && ref.current) ref.current.style.filter = "";
      }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
