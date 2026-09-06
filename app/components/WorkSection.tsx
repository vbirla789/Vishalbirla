"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { colors, t, type } from "../theme";
import { playHover } from "../lib/sound";
import ConceptLightbox from "./ConceptLightbox";
import ExperienceTimeline from "./ExperienceTimeline";
import SectionLabel from "./SectionLabel";

/* ---------- Work case studies ---------- */

type Project = {
  slug: string;
  company: string;
  year: string;
  logo: string;
  title: string;
  preview?: React.ReactNode; // abstract preview when no real image
  image?: string; // real screenshot for the card
  video?: string; // looping mockup video (takes precedence over image)
};

const projects: Project[] = [
  {
    slug: "noon",
    company: "noon",
    year: "2026",
    logo: "/logos/noon.jpeg",
    title: "Designing an AI-assisted review flow to add a review in seconds",
    image: "/work/noon/preview.png",
    video: "/work/noon/ai-1.mp4",
  },
  {
    slug: "ambitio",
    company: "Ambitio",
    year: "2025",
    logo: "/logos/ambitio.avif",
    title: "Rebuilding Ambitio's dashboard to drive 14% more adoption",
    image: "/work/ambitio/course-finder.png",
  },
  {
    slug: "fibr",
    company: "Fibr.ai",
    year: "2025",
    logo: "/logos/fibr.avif",
    title: "A Framer CMS that scaled Fibr.ai's traffic by 35%",
    image: "/work/fibr/liv.png",
  },
];

/* ---------- Experience ---------- */
// Data lives in app/lib/experience.ts so the homepage (a Server Component)
// can import it too — see the note in that file.

/* Each blurb shows in the concept detail sidebar (ConceptLightbox). */
const funVideos = [
  {
    src: "/fun/experiment-1.mp4",
    title: "Expense Tracker",
    year: "2026",
    blurb:
      "A native SwiftUI iPhone app that logs every spend automatically through a Shortcut — dashboard, splits with contacts, swipe to edit. A Google Sheet is the whole backend.",
  },
  {
    src: "/fun/experiment-2.mp4",
    title: "Onboarding Flow",
    year: "2026",
    blurb:
      "A motion study for a first-run experience — each step earns the next screen, so setup reads as progress rather than a form.",
  },
  {
    src: "/fun/experiment-3.mp4",
    title: "Post Review Submission",
    year: "2026",
    blurb:
      "The moment right after you post a review — a thank-you state that rolls straight into rating your other recent orders, one tap each, while the goodwill is still warm.",
  },
];

/* ---------- building blocks ---------- */

/**
 * Company logo with a name tooltip on hover.
 *
 * Uses the shared .t-tt tooltip (globals.css) — pure CSS, so this stays usable
 * from the homepage, which is a Server Component.
 */
export function LogoMark({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="t-tt-wrap shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${alt} logo`}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-[8px] object-cover ring-1 ring-black/5 dark:ring-[color:var(--c-line)]"
      />
      <span role="tooltip" className="t-tt">
        {alt}
      </span>
    </span>
  );
}

function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className="scroll-mt-28"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </motion.section>
  );
}

/* ---------- single-page stacked sections ---------- */

export default function WorkSection() {
  /* Which concept the detail overlay shows, and which way the last navigation
     went (for the slide direction inside the overlay). null = closed. */
  const [concept, setConcept] = useState<{ i: number; dir: number } | null>(null);

  return (
    <div className="space-y-20">
      {/* WORK */}
      <Section id="work" label="Work">
        <div className="grid grid-cols-1 gap-16">
          {projects.map((p) => (
            <Link key={p.company} href={`/work/${p.slug}`} className="group block">
              {/* single image container */}
              <div className="h-[240px] overflow-hidden rounded-2xl bg-zinc-100 sm:h-[360px] lg:h-[480px]">
                {p.video ? (
                  <div className="flex h-full items-center justify-center p-6 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                    <div className="h-full overflow-hidden rounded-[7px] sm:rounded-[10px] lg:rounded-[24px]">
                      <video
                        src={p.video}
                        poster={p.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="block h-full w-auto object-contain"
                      />
                    </div>
                  </div>
                ) : p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={`${p.company} preview`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full p-8 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                    {p.preview}
                  </div>
                )}
              </div>

              {/* title + company logo · name · year in one row (auto gap) */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                {/* title */}
                <h3
                  className="max-w-[560px] font-sans"
                  style={{ ...t(type.caseH2), fontSize: 18, lineHeight: "26px", color: colors.primary }}
                >
                  {p.title}
                </h3>

                {/* company logo · name · year
                    Size and colour live on the row, not the spans: the company
                    was 16px and the year 15px, which read as a wobble on one
                    line. Setting it once means the three parts cannot drift. */}
                <div
                  className="flex shrink-0 items-center gap-2"
                  style={{ fontSize: 16, color: colors.tertiary }}
                >
                  <span>{p.company}</span>
                  <span>·</span>
                  <span>{p.year}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* EXPERIENCE — timeline accordion */}
      <Section id="experience" label="Experience">
        <ExperienceTimeline />
      </Section>

      {/* CONCEPTS — three scaled-down cards that fit the column */}
      <Section id="fun" label="Concepts">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {funVideos.map((v, i) => (
            <button
              key={v.src}
              type="button"
              onClick={() => {
                playHover();
                setConcept({ i, dir: 0 });
              }}
              aria-haspopup="dialog"
              // stays theme-aware: the title and year live *inside* this card,
              // so a permanently-light fill would put white text on white
              className="flex cursor-pointer flex-col gap-8 rounded-2xl bg-zinc-50 p-4 text-left ring-1 ring-black/5 outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[color:var(--c-primary)]/40 dark:bg-[color:var(--c-panel)] dark:ring-[color:var(--c-line)]"
            >
              {/* video — full, correct iPhone aspect (no crop), rounded corners */}
              <div className="flex justify-center">
                <div className="overflow-hidden rounded-[18px]">
                  <video
                    className="block h-[320px] w-auto object-contain"
                    src={v.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>
              {/* title + year */}
              <div className="flex items-center justify-between">
                <span style={{ ...t(type.projectTitle), fontSize: 13 }}>
                  {v.title}
                </span>
                <span
                  style={{ ...t(type.expMeta), color: colors.tertiary, fontSize: 12 }}
                >
                  {v.year}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* concept detail overlay — media morphs left, details slide in right */}
      <AnimatePresence>
        {concept !== null && (
          <ConceptLightbox
            concepts={funVideos}
            index={concept.i}
            direction={concept.dir}
            onClose={() => setConcept(null)}
            onNavigate={(next, dir) => setConcept({ i: next, dir })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
