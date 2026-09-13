"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Typewriter from "./fancy/typewriter";
import { colors, t, type } from "../theme";

/* Framed portrait with the name and typed line set beside it.

   The frame keeps the timeline widget's fill-and-hairline treatment, but both
   corners are square and the 4px padding is even on all four sides — so the
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
          className="border p-[4px] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: colors.panel, borderColor: colors.line }}
        >
          {/* 48×60 holds the source's 4:5 exactly, so the crop isn't squeezed.
              Sized against the name block beside it: the reference this follows
              sits the picture only a little taller than its two lines of type,
              and every step down from the original 105px has been closing that
              gap. The head-and-shoulders crop is what lets it go this small and
              still read as a face. */}
          <div className="relative h-[60px] w-[48px] overflow-hidden">
            <Image
              /* Filename carries the crop, so replacing the photo means a new
                 name rather than overwriting this one. next/image keys its
                 cache on the URL, so an in-place swap keeps serving the old
                 picture to anyone who already has it — browser and CDN alike. */
              src="/vishal.jpg"
              alt="Vishal Birla"
              fill
              sizes="48px"
              /* 90, not a higher number: next.config.ts declares
                 qualities: [75, 90], and anything outside that list fails the
                 production build. */
              quality={90}
              priority
              className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
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
            aboutBody rather than by resizing expMeta into a duplicate of it. */}
        <p style={{ ...t(type.aboutBody), fontWeight: 400 }}>
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
