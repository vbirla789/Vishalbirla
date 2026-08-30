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
    summary: "Making it effortless to leave a review worth reading.",
    bullets: [
      "Redesigned the AI-assisted review submission flow for noon ecommerce, streamlining the end-to-end review experience.",
      "Built reusable components for the Field Design System — product cards, toasts, tooltips, section headers and other scalable UI patterns.",
      "Redesigned the Image-First Navigation experience for the UGC segment to improve content discovery and drive higher conversion.",
    ],
  },
  {
    role: "Product Designer Intern",
    company: "Ambitio",
    period: "July 2025 - April 2026",
    mode: "Onsite",
    logo: "/logos/ambitio.avif",
    summary: "Helping students abroad see their whole application in one place.",
    bullets: [
      "Designed the NOVA dashboard for students aspiring to study abroad, focusing on clarity and engagement.",
      "Conducted user research and translated insights into user flows and wireframes.",
      "Created modules for profile building, goal tracking, and university discovery in Figma.",
      "Developed a scalable design system and collaborated with developers for smooth handoff.",
    ],
  },
  {
    role: "Product Designer (Contract)",
    company: "Fibr.ai",
    period: "April 2025 - July 2025",
    mode: "Onsite",
    logo: "/logos/fibr.avif",
    summary: "Designing and shipping the surfaces a SaaS product is judged on.",
    bullets: [
      "Designed and developed key dashboard interfaces for Fibr's SaaS platform, focusing on usability and visual clarity.",
      "Built authentication and onboarding screens to streamline user entry for new customers.",
      "Worked on Fibr's marketing website in Framer, improving performance, SEO and content management.",
    ],
  },
  {
    role: "Product Designer Intern",
    company: "DZINR",
    period: "Jan 2025 - Mar 2025",
    mode: "Remote",
    logo: "/logos/dzinr.avif",
    summary: "A brand site rebuilt to feel as considered as the work on it.",
    bullets: [
      "Redesigned and developed the Dzinr website in Figma and Framer for a responsive, engaging experience.",
      "Collaborated with a marketing team to keep a consistent brand identity end to end.",
      "Streamlined delivery by leaning on Framer's interactive prototyping.",
    ],
  },
];
