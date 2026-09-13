"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Typewriter from "./fancy/typewriter";
import { colors, t, type } from "../theme";

/* Framed portrait with the name and typed line set beside it.

   The frame keeps the timeline widget's fill-and-hairline treatment, but both
   corners are square and the 2px padding is even on all four sides — so the
   outer and inner edges stay parallel with no radius to reconcile between them.

   Desaturated at rest so it sits behind the type rather than competing with
   the name, and comes to colour on hover. */
export default function AboutPhoto() {
  return (
    <div className="mb-6 flex items-center gap-4">
      <motion.div
        className="group shrink-0 will-change-transform"
        /* Hangs square. With the tilt gone, hover only lifts it a little —
           there is no longer anything to straighten. */
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div
          className="border p-[2px] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: colors.panel, borderColor: colors.line }}
        >
          {/* Height is derived, not chosen: the frame is meant to stand exactly
              as tall as the name and typed line beside it. Those are two 24px
              lines with a 4px gap — 52px — and the frame adds 4px of padding
              and 2px of border, so the picture itself is 52 − 6 = 46px.
              Change the type or the padding and this number has to follow:
              tightening the padding from 4px to 2px is what last grew the
              photo from 42px, since the frame total has to hold at 52.

              Width then follows the photo rather than the other way round:
              46 × 4/5 = 36.8, so 37px lets the whole frame show instead of
              cropping it. object-top survives only to absorb the fraction
              that rounding up to 37 leaves over, and it drops that from the
              lap rather than the top of his head. */}
          <div className="relative h-[46px] w-[37px] overflow-hidden">
            <Image
              /* Filename carries the crop, so replacing the photo means a new
                 name rather than overwriting this one. next/image keys its
                 cache on the URL, so an in-place swap keeps serving the old
                 picture to anyone who already has it — browser and CDN alike. */
              src="/vishal.jpg"
              alt="Vishal Birla"
              fill
              sizes="37px"
              /* 90, not a higher number: next.config.ts declares
                 qualities: [75, 90], and anything outside that list fails the
                 production build. */
              quality={90}
              priority
              className="object-cover object-top grayscale transition-[filter] duration-500 group-hover:grayscale-0"
            />
          </div>
        </div>
      </motion.div>

      <div>
        {/* The page's only h1. Deliberately no font-sans: that class is the
            opt-out from the Geist Pixel treatment @layer base gives every
            heading, so leaving it off is what puts the name in pixel type —
            and brings the stroke weight bump with it, which is the correction
            Geist Pixel needs since it ships a single 400 face. */}
        <h1 style={{ ...t(type.expOrg), fontSize: "18px", lineHeight: "24px" }}>
          Vishal Birla
        </h1>
        {/* 16px/400 — same values as the paragraph below, reached through
            aboutBody rather than by resizing expMeta into a duplicate of it.
            mt-1 is the 4px gap the frame's height is measured against.

            font-mono matches the section labels (ABOUT, WORK, CRAFTED
            EXPERIENCES AT), which is also what keeps the typed line from
            reflowing mid-cycle: every glyph is the same width, so the cursor
            advances evenly instead of jittering as letters of different widths
            arrive. */}
        <p className="mt-1 font-mono" style={{ ...t(type.aboutBody), fontWeight: 400 }}>
          {/* The typed text starts empty, so on its own this line is blank in
              the server HTML. The real role is here and hidden visually; the
              animation is decorative and marked aria-hidden. */}
          <span className="sr-only">Product Designer</span>
          <span aria-hidden="true">
            <Typewriter
              as="span"
              /* Qualities only. The literal job title was the first entry and
                 is gone: the paragraph below already opens "Product designer
                 based in India", so this line spent its first pass repeating
                 what the next one says. The sr-only text above still carries
                 the real role for screen readers and crawlers. */
              text={[
                "Designer who builds",
                "Coffee enthusiast",
                "2px negotiator",
              ]}
              speed={70}
              deleteSpeed={40}
              waitTime={2200}
              cursorChar="_"
              cursorClassName="ml-1 text-[color:var(--c-accent)]"
            />
          </span>
        </p>
      </div>
    </div>
  );
}
