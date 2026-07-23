"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { colors, t, type } from "../theme";

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

const experience: {
  role: string;
  company: string;
  period: string;
  logo: string;
}[] = [
  {
    role: "Product Designer Intern",
    company: "noon",
    period: "May 2026 - present",
    logo: "/logos/noon.jpeg",
  },
  {
    role: "Product Designer Intern",
    company: "Ambitio",
    period: "July 2025 - April 2026",
    logo: "/logos/ambitio.avif",
  },
  {
    role: "Product Designer (Contract)",
    company: "Fibr.ai",
    period: "April 2025 - July 2025",
    logo: "/logos/fibr.avif",
  },
  {
    role: "Product Designer Intern",
    company: "DZINR",
    period: "Jan 2025 - April 2025",
    logo: "/logos/dzinr.avif",
  },
];

const funVideos = [
  { src: "/fun/experiment-1.mp4", title: "Expense Tracker", year: "2026" },
  { src: "/fun/experiment-2.mp4", title: "Onboarding Flow", year: "2026" },
  { src: "/fun/experiment-3.mp4", title: "Post Review Submission", year: "2026" },
];

/* ---------- building blocks ---------- */

function LogoMark({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${alt} logo`}
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-[8px] object-cover ring-1 ring-black/5"
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 font-mono uppercase" style={t(type.aboutLabel)}>
      {children}
    </p>
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
                  className="max-w-[560px]"
                  style={{ ...t(type.caseH2), fontSize: 18, lineHeight: "26px", color: "#1D2539" }}
                >
                  {p.title}
                </h3>

                {/* company logo · name · year */}
                <div className="flex shrink-0 items-center gap-2">
                  <span style={{ fontSize: 16, color: colors.tertiary }}>
                    {p.company}
                  </span>
                  <span style={{ color: colors.tertiary }}>·</span>
                  <span style={{ fontSize: 15, color: colors.tertiary }}>
                    {p.year}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* EXPERIENCE */}
      <Section id="experience" label="Experience">
        <div className="flex flex-col border-t border-black/5">
          {experience.map((e) => (
            <div
              key={e.company + e.role}
              className="border-b border-black/5 py-4"
            >
              {/* mobile: LinkedIn-style — logo · (role / company) · date-right */}
              <div className="flex gap-3.5 sm:hidden">
                <LogoMark src={e.logo} alt={e.company} />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div style={{ fontSize: 15, fontWeight: 500, color: colors.primary }}>
                      {e.role}
                    </div>
                    <div className="mt-0.5" style={{ fontSize: 14, color: colors.secondary }}>
                      {e.company}
                    </div>
                  </div>
                  <span
                    className="whitespace-nowrap text-right"
                    style={{ fontSize: 13, color: colors.tertiary }}
                  >
                    {e.period}
                  </span>
                </div>
              </div>

              {/* desktop: company · role · date */}
              <div className="hidden sm:grid sm:grid-cols-[240px_1fr_auto] sm:items-center sm:gap-4">
                <div className="flex items-center gap-3.5">
                  <LogoMark src={e.logo} alt={e.company} />
                  <span style={{ fontSize: 16, fontWeight: 500, color: colors.primary }}>
                    {e.company}
                  </span>
                </div>
                <span
                  className="justify-self-start"
                  style={{ fontSize: 16, fontWeight: 500, color: colors.primary }}
                >
                  {e.role}
                </span>
                <span
                  className="justify-self-end whitespace-nowrap"
                  style={{ fontSize: 15, color: colors.tertiary }}
                >
                  {e.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CONCEPTS — three scaled-down cards that fit the column */}
      <Section id="fun" label="Concepts">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {funVideos.map((v) => (
            <div
              key={v.src}
              className="flex flex-col gap-8 rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5"
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
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
