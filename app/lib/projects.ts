/* ----------------------------------------------------------------------------
 * Case-study content for the Work section detail pages.
 * All copy here is placeholder / dummy — swap for real narrative + assets later.
 * Structure mirrors a strong case study: Problem → Outcomes → Solution → Process.
 * --------------------------------------------------------------------------*/

export type Metric = { value: string; label: string };
export type ProblemPoint = { title: string; body: string };

export type MediaKind = "phone" | "panel" | "duo" | "chart" | "photos";

// A media slot renders a real image (or grid of images) when `image`/`images`
// is set; otherwise it falls back to an abstract `media` placeholder.
export type DetailSection = {
  title: string;
  body: string;
  media?: MediaKind;
  image?: string;
  images?: string[];
  caption?: string;
  table?: { columns: string[]; rows: string[][] };
};

export type Project = {
  slug: string;
  company: string;
  year: string;
  role: string;
  title: string;
  overview: string;
  collaborators: string[];
  hero?: { image?: string; media?: MediaKind; video?: string };
  problem: {
    heading: string;
    body: string;
    points: ProblemPoint[];
    media?: MediaKind;
    image?: string;
    images?: string[];
  };
  outcomes?: { heading: string; body: string; metrics: Metric[] };
  solution: { heading: string; body: string; sections: DetailSection[] };
  experiments?: { heading: string; body: string; videos?: string[] };
  process: {
    heading: string;
    body: string;
    note: string;
    media?: MediaKind;
    images?: string[];
  };
};

export const projects: Project[] = [
  {
    slug: "noon",
    company: "noon",
    year: "2026",
    role: "Product Designer Intern",
    title: "Designing an AI-assisted reviews & ratings flow",
    overview:
      "On noon, reviews are the cheapest salesperson — they replace in-store trust at scale, weed out weak catalog, and help good products rank. I redesigned the review-submission flow so a helpful, media-rich review takes seconds, not effort.",
    collaborators: [
      "Abdelrahman Baher (PM)",
      "Siddhant Ghosh (SPD)",
      "Saransh Rawat (MD)",
    ],
    hero: { video: "/work/noon/proto.mp4" },
    problem: {
      heading: "Almost every review on noon is a single star tap",
      body: "Photo and text reviews are what actually move shoppers — photo-review viewers add to cart at nearly 2× the PDP average. But the flow to create them is so heavy that most people stop at the star.",
      points: [
        {
          title: "The star tap is the easy way out",
          body: "~4 in 5 reviews are just a star — no text, no photo. Ask for anything more and most people drop off.",
        },
        {
          title: "The best reviews are the rarest",
          body: "Fewer than 1 in 25 reviews has a photo or video — the very content that sells. The effort bar is simply too high.",
        },
        {
          title: "The wrong people write",
          body: "Reviews skew to the extremes — delighted or angry. The satisfied majority taps a star and leaves, so the picture isn't representative.",
        },
      ],
    },
    solution: {
      heading: "Make writing a review as easy as tapping",
      body: "The real blocker was the blank text box — so people just tapped a star. Now they tap chips instead, and AI turns those into a real review.",
      sections: [
        {
          title: "Rating-aware question chips",
          body: "Eight parameters, split by the rating you give — all positives at 5 stars, all improvements at 1, a mix in between. Just tap what fits; no blank page.",
          image: "/work/noon/rating-states.png",
          caption: "The same 8 parameters, split by rating (5★ → 1★)",
          table: {
            columns: ["Star rating", "What went well?", "What could have been better?"],
            rows: [
              ["5", "8 chips", "—"],
              ["4", "6 chips", "2 chips"],
              ["3", "4 chips", "4 chips"],
              ["2", "2 chips", "6 chips"],
              ["1", "—", "8 chips"],
            ],
          },
        },
        {
          title: "One tap to generate the review",
          body: "Hit Generate and AI turns your taps into a first-person review — post as-is, tweak, or add photos. Editing a draft beats a blank box, so more people actually write.",
          image: "/work/noon/generate.png",
          caption: "From picks to a first-person review — post, tweak, or add photos",
        },
      ],
    },
    experiments: {
      heading: "Pushing the flow further with AI",
      body: "Beyond the shipped feature, I love prototyping with AI to explore what an AI-assisted review experience could become. A few of the experiments I built on top of this design:",
      videos: ["/work/noon/ai-1.mp4"],
    },
    process: {
      // TODO: attach the prototype + usability findings here.
      heading: "Testing & rollout",
      body: "I built a design system for the flow — chips, toggles, AI states, photo-upload states, and review cards — so every screen stays consistent as the feature scales. It's in development now, heading into usability testing.",
      images: ["/work/noon/system.png"],
      note: "",
    },
  },
  {
    slug: "ambitio",
    company: "Ambitio",
    year: "2025",
    role: "Product Designer — end-to-end",
    title: "Rebuilding Ambitio's dashboard to drive 14% more adoption",
    overview:
      "Ambitio helps students applying abroad go from 'where do I even start' to a submitted application. I redesigned the core dashboard end-to-end — the flow where students discover programs, track applications, and prepare their documents — turning a dense, feature-heavy product into a clear, guided journey.",
    collaborators: [],
    hero: { image: "/work/ambitio/manage-applications.png" },
    problem: {
      heading: "The product held everything — but told no clear story",
      body: "Applying abroad means juggling dozens of programs, documents, deadlines, and scholarships. Ambitio had grown feature by feature, so all that data lived in the product but with no clear hierarchy or next step. Screens were dense and generic, statuses were unclear, and students still fell back to spreadsheets and WhatsApp — which is exactly why the dashboard was underused.",
      points: [
        {
          title: "Dense, generic screens",
          body: "Detail pages had bloated over time and data points were generic, so students couldn't quickly judge fit — or even tell what was clickable.",
        },
        {
          title: "No single source of truth",
          body: "Application statuses, deadlines, and required documents lived in different places, so a student could never see — at a glance — where each application actually stood.",
        },
        {
          title: "Documents stalled in limbo",
          body: "SOPs, LORs, and essays had no clear owner or status, so work quietly stalled and nobody knew what was blocking a submission.",
        },
      ],
    },
    outcomes: {
      heading: "One clear journey, and a dashboard students return to",
      body: "Restructuring the product around the applicant's real journey — discover, apply, prepare, fund — moved the metrics that mattered.",
      metrics: [
        { value: "+14%", label: "Dashboard weekly-active adoption" },
        { value: "2.3×", label: "Faster to the next action" },
        { value: "−30%", label: "'What do I do next?' support queries" },
      ],
    },
    solution: {
      heading: "Rebuild the product around the applicant's journey",
      body: "Instead of a pile of features, I organised everything into four clear steps — discover, apply, prepare documents, and fund — and gave every screen an obvious status and next action.",
      sections: [
        {
          title: "1 · Discover programs you're actually eligible for",
          body: "Course Finder surfaces programs with the few things that drive a decision — ranking, tuition, acceptance rate, deadline, and a clear 'Eligible' tag — so students shortlist with confidence. Program detail pages lead with those decision-drivers instead of a wall of generic data.",
          images: [
            "/work/ambitio/course-finder.png",
            "/work/ambitio/course-detail.png",
          ],
          caption: "Course Finder and program detail — decision-drivers up front",
        },
        {
          title: "2 · One dashboard for every application",
          body: "Manage Applications puts every program in a single view with its status (Not started → In progress → Submitted → Accepted), target deadline, documents required, and a progress bar — so students always know exactly where each application stands and what's left to do.",
          images: [
            "/work/ambitio/manage-applications.png",
            "/work/ambitio/application-detail.png",
          ],
          caption: "Status, deadline, documents, and progress — all in one place",
        },
        {
          title: "3 · Documents that move, not pile up",
          body: "Document Manager gives every SOP, LOR, and essay a clear owner and status — Writer assigned, Need review, Completed — so nothing stalls silently and students can see what's blocking a submission.",
          image: "/work/ambitio/document-manager.png",
          caption: "Every document organised by a clear, honest status",
        },
        {
          title: "4 · Funding, surfaced — not searched",
          body: "Scholarship Finder brings relevant scholarships — amount, deadline, type, and country — into the same flow, so funding stops being a separate, forgotten task.",
          image: "/work/ambitio/scholarship-finder.png",
          caption: "Relevant scholarships, right inside the application flow",
        },
      ],
    },
    process: {
      heading: "A system behind the screens",
      body: "To keep 8+ surfaces consistent as the product kept growing, I built a shared component system — buttons, tabs, notifications, statuses, and steppers — so every new feature ships on-brand and predictable, and the whole product reads as one coherent journey.",
      images: ["/work/ambitio/components.png"],
      note: "",
    },
  },
  {
    slug: "fibr",
    company: "Fibr.ai",
    year: "2025",
    role: "Website design & Framer development — end-to-end",
    title: "A Framer CMS that scaled Fibr.ai's traffic by 35%",
    overview:
      "At Fibr.ai, I led the design and development of their complete website infrastructure built on Framer — including agent-specific pages for Liv, Max, and Aya, and a scalable CMS for conversion rate optimization across all 50 US states.",
    collaborators: [],
    hero: { image: "/work/fibr/cro-agency.png" },
    problem: {
      heading: "Scaling a CRO web presence across 50 states — without the maintenance overhead",
      body: "Fibr.ai needed a web presence that could target diverse geographic markets while holding to CRO best practices. It had to support multiple AI-agent pages with dynamic content and deliver localized experiences across all 50 US states — all without ballooning into an unmaintainable pile of pages.",
      points: [
        {
          title: "50 states, one team",
          body: "Every state needed its own localized, SEO-ready page. Hand-building and maintaining those manually would have been impossible for a lean team.",
        },
        {
          title: "Three distinct AI agents",
          body: "Liv, Max, and Aya each needed a conversion-optimized page with its own story and interactive elements — while still feeling like one coherent product.",
        },
        {
          title: "CRO best-practices, everywhere",
          body: "Consistency mattered: every page had to follow proven conversion patterns rather than drift as new content was added.",
        },
      ],
    },
    outcomes: {
      heading: "A scalable system that compounds traffic and efficiency",
      body: "The Framer build turned a manual, design-bound process into a content-driven system — unlocking geographic reach and measurable growth.",
      metrics: [
        { value: "+35%", label: "Increase in targeted traffic" },
        { value: "+20%", label: "Improvement in CAC efficiency" },
        { value: "50", label: "US states with localized CMS pages" },
      ],
    },
    solution: {
      heading: "Agent pages up front, a CMS engine underneath",
      body: "I designed and built the whole site in Framer: conversion-focused pages for each AI agent, a CMS architecture that scales to every state, and a dynamic FAQ system that the team can maintain from a spreadsheet.",
      sections: [
        {
          title: "Conversion-optimized AI agent pages",
          body: "Three dedicated pages — Aya (website monitoring), Liv (ad-to-page personalization), and Max (A/B testing) — each with interactive hero elements and layouts built around a clear, single conversion goal, while sharing one design language.",
          images: [
            "/work/fibr/aya.png",
            "/work/fibr/liv.png",
            "/work/fibr/max.png",
          ],
          caption: "Agent pages for Aya, Liv, and Max",
        },
        {
          title: "A scalable CMS for 50 states",
          body: "A CMS architecture drives 50 state-specific pages from a single set of templates. Localized content and targeted messaging flow in through CMS fields, so the marketing team can expand into a new market without touching layout or code.",
          image: "/work/fibr/cro-agency.png",
          caption: "One system, every market — on-brand by construction",
        },
        {
          title: "A dynamic FAQ system powered by Google Sheets",
          body: "I integrated Framer CMS with Google Sheets so the FAQ section — categories and answers alike — stays dynamic and easy to maintain. Non-technical teammates update a sheet and the site follows, no redeploy required.",
          image: "/work/fibr/faq.png",
          caption: "CMS-driven FAQ, editable straight from a spreadsheet",
        },
      ],
    },
    process: {
      heading: "Key learnings",
      body: "Building this end-to-end sharpened four things: architecting for scalability from day one, integrating external data sources (Framer CMS × Google Sheets) cleanly, letting CRO principles drive design decisions, and working at the intersection of design and development to ship without a handoff.",
      note: "Designing and building in the same tool meant every CRO decision could be validated live — no gap between the mockup and the shipped page.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
