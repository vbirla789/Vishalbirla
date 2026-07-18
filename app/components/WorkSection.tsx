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
};

const projects: Project[] = [
  {
    slug: "ambitio",
    company: "Ambitio",
    year: "2025",
    logo: "/logos/ambitio.avif",
    title: "Driving 14% Dashboard Adoption Through Strategic UX Redesign",
    preview: <AmbitioPreview />,
  },
  {
    slug: "fibr",
    company: "Fibr.ai",
    year: "2025",
    logo: "/logos/fibr.avif",
    title: "Driving 35% Traffic Growth Through Strategic CMS Design in Framer",
    image: "/work/fibr/max.avif",
  },
];

function AmbitioPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          Dashboard Adoption
        </span>
        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
          +14%
        </span>
      </div>
      <div className="flex h-24 items-end gap-2">
        {[38, 52, 46, 63, 58, 74, 82].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#7c5cff] to-[#a78bfa]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[10px] text-zinc-400">
        <span>Week 1</span>
        <span className="ml-auto">Week 7</span>
      </div>
    </div>
  );
}


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
    period: "May 2026 — present",
    logo: "/logos/noon.jpeg",
  },
  {
    role: "Product Designer Intern",
    company: "Ambitio",
    period: "July 2025 — April 2026",
    logo: "/logos/ambitio.avif",
  },
  {
    role: "Product Designer (Contract)",
    company: "Fibr.ai",
    period: "April 2025 — July 2025",
    logo: "/logos/fibr.avif",
  },
  {
    role: "Product Designer Intern",
    company: "DZINR",
    period: "Jan 2025 — April 2025",
    logo: "/logos/dzinr.avif",
  },
  {
    role: "Product Designer Intern",
    company: "Unoptimsed Std.",
    period: "Nov 2024 — Dec 2024",
    logo: "/logos/unoptimised.avif",
  },
];

const funCards = [
  "Customizing Android phones",
  "Sketching random ideas",
  "Playing with code & AI",
  "Building tiny tools",
];

/* ---------- building blocks ---------- */

function LogoMark({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${alt} logo`}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-[8px] object-cover ring-1 ring-black/5"
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
              <div className="h-[320px] overflow-hidden rounded-2xl bg-zinc-100">
                {p.image ? (
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

              {/* title */}
              <h3 className="mt-6 max-w-[560px]" style={t(type.caseH2)}>
                {p.title}
              </h3>

              {/* company logo · name · year */}
              <div className="mt-3 flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-md object-cover ring-1 ring-black/5"
                />
                <span
                  className="font-mono uppercase"
                  style={{ fontSize: 13, letterSpacing: "0.02em", color: colors.tertiary }}
                >
                  {p.company}
                </span>
                <span style={{ color: colors.tertiary }}>·</span>
                <span
                  className="font-mono uppercase"
                  style={{ fontSize: 13, letterSpacing: "0.02em", color: colors.tertiary }}
                >
                  {p.year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* EXPERIENCE */}
      <Section id="experience" label="Experience">
        <div className="flex flex-col gap-8">
          {experience.map((e) => (
            <div
              key={e.company + e.role}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <h3 style={t(type.expOrg)}>{e.role}</h3>
                <div className="mt-2 flex items-center gap-2.5">
                  <LogoMark src={e.logo} alt={e.company} />
                  <span style={t(type.expCompany)}>{e.company}</span>
                </div>
              </div>
              <div className="whitespace-nowrap" style={t(type.expMeta)}>
                {e.period}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FUN */}
      <Section id="fun" label="Fun">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {funCards.map((f, i) => (
            <div
              key={f}
              className="flex h-32 items-end rounded-2xl p-4 text-[14px] font-medium text-white"
              style={{
                background: [
                  "linear-gradient(135deg,#7c5cff,#a78bfa)",
                  "linear-gradient(135deg,#f97316,#fb923c)",
                  "linear-gradient(135deg,#111,#3f3f46)",
                  "linear-gradient(135deg,#0ea5e9,#38bdf8)",
                ][i % 4],
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
