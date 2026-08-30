/* ----------------------------------------------------------------------------
 * Experience — the roles rendered by the Experience timeline, and the company
 * icons reused by the homepage "Crafted experiences at" row.
 *
 * This lives in its own module (no "use client") on purpose: page.tsx is a
 * Server Component, and only *component* references cross the client boundary.
 * Exporting this array from a "use client" file would hand the server an
 * opaque client-reference proxy instead of the array.
 *
 * `summary` + `bullets` are what the accordion reveals; they mirror the resume
 * so the two never tell different stories.
 * --------------------------------------------------------------------------*/

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  /** Onsite / Remote — shown next to the period. */
  mode?: string;
  logo: string;
  /** true = ongoing, draws the live dot on the logo */
  current?: boolean;
  /** One-line framing, shown first when expanded. */
  summary?: string;
  bullets?: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Product Designer Intern",
    company: "noon",
    period: "May 2026 - present",
    mode: "Onsite",
    logo: "/logos/noon.jpeg",
    current: true,
    summary: "Making reviews effortless to write.",
    bullets: [
      "Redesigned the **AI-assisted review flow** — a blank text box became a few taps.",
      "Built **Field Design System** components: cards, toasts, tooltips, section headers.",
      "Redesigned **Image-First Navigation** for UGC to lift content discovery.",
    ],
  },
  {
    role: "Product Designer Intern",
    company: "Ambitio",
    period: "July 2025 - April 2026",
    mode: "Onsite",
    logo: "/logos/ambitio.avif",
    summary: "One place to see a whole application.",
    bullets: [
      "Designed the **NOVA dashboard** for study-abroad applicants.",
      "Ran **user research** and turned it into flows and wireframes.",
      "Shipped **profile building, goal tracking** and university discovery.",
      "Built a **scalable design system** for developer handoff.",
    ],
  },
  {
    role: "Product Designer (Contract)",
    company: "Fibr.ai",
    period: "April 2025 - July 2025",
    mode: "Onsite",
    logo: "/logos/fibr.avif",
    summary: "The surfaces a SaaS product gets judged on.",
    bullets: [
      "Designed key **dashboard interfaces** for their SaaS platform.",
      "Built **auth and onboarding** to smooth the first run.",
      "Rebuilt the marketing site in **Framer** — faster, better SEO.",
    ],
  },
  {
    role: "Product Designer Intern",
    company: "DZINR",
    period: "Jan 2025 - Mar 2025",
    mode: "Remote",
    logo: "/logos/dzinr.avif",
    summary: "A brand site as considered as the work on it.",
    bullets: [
      "Rebuilt the site in **Figma and Framer**, fully responsive.",
      "Held a **consistent brand identity** with the marketing team.",
      "Cut delivery time using **Framer prototyping**.",
    ],
  },
];
