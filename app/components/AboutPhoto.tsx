"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { colors, t, type } from "../theme";

/* Framed portrait with the name and role set beside it.

   The frame keeps the timeline widget's fill-and-hairline treatment, but the
   padding is even on all four sides and the photo itself is square-cornered.
   The radius on the outer frame is therefore 6px to match that 6px gap: with a
   square inner edge, outer = inner + padding is what keeps the two outlines
   concentric instead of the corner appearing to thicken.

   Desaturated at rest so it sits behind the type rather than competing with
   the headline, and comes to colour as it straightens on hover. */
export default function AboutPhoto() {
  return (
    <div className="mb-6 flex items-center gap-4">
      <motion.div
        className="group shrink-0 will-change-transform"
        /* The tilt is the resting state, not an entrance — animating from 0 to
           -3 would read as the photo drifting out of true after load. */
        initial={{ rotate: -3 }}
        whileHover={{ rotate: 0, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div
          className="rounded-[6px] border p-[6px] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: colors.panel, borderColor: colors.line }}
        >
          {/* 84×105 holds the source's 4:5 exactly, so the crop isn't squeezed. */}
          <div className="relative h-[105px] w-[84px] overflow-hidden">
            <Image
              src="/me.jpg"
              alt="Vishal Birla"
              fill
              sizes="84px"
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
        <div style={t(type.expOrg)}>Vishal Birla</div>
        <div style={t(type.expMeta)}>Product Designer</div>
      </div>
    </div>
  );
}
