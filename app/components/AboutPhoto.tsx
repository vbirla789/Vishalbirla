"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { colors } from "../theme";

/* The portrait that opens the About section, standing on its own above the
   greeting.

   Frame keeps the timeline widget's fill-and-hairline treatment: square
   corners, 2px of padding even on all four sides, so the outer and inner edges
   stay parallel with no radius to reconcile between them.

   Desaturated at rest so it sits behind the type rather than competing with
   it, and comes to colour on hover. */
export default function AboutPhoto() {
  return (
    <motion.div
      className="group mb-4 inline-block will-change-transform"
      /* Hangs square — hover only lifts it, there is nothing to straighten. */
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div
        className="border p-[2px] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
        style={{ backgroundColor: colors.panel, borderColor: colors.line }}
      >
        {/* 56×70 is the source's 4:5 exactly, so object-cover has nothing to
            trim and the whole crop shows. Sizing is free here in a way it
            wasn't before: this used to sit beside the name and had to match
            that text block's height to the pixel. Standing alone, it only has
            to look right. */}
        <div className="relative h-[70px] w-[56px] overflow-hidden">
          <Image
            /* Filename carries the crop, so replacing the photo means a new
               name rather than overwriting this one. next/image keys its cache
               on the URL, so an in-place swap keeps serving the old picture to
               anyone who already has it — browser and CDN alike. */
            src="/vishal.jpg"
            alt="Vishal Birla"
            fill
            sizes="56px"
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
  );
}
