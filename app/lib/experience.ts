/* ----------------------------------------------------------------------------
 * Experience — the roles rendered by the Experience section, and the company
 * icons reused by the homepage "Crafted experiences at" row.
 *
 * This lives in its own module (no "use client") on purpose: page.tsx is a
 * Server Component, and only *component* references cross the client boundary.
 * Exporting this array from a "use client" file would hand the server an
 * opaque client-reference proxy instead of the array.
 * --------------------------------------------------------------------------*/

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  logo: string;
};

export const experience: ExperienceEntry[] = [
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
