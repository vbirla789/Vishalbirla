/* ----------------------------------------------------------------------------
 * Case-study content for the Work section detail pages.
 * Structure: Problem → (Outcomes) → Solution → (AI Experiments) → Process.
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

// A single media slot inside a story block. Renders (in order) a video, a grid
// of images, a single image, an abstract placeholder kind, or a labeled dashed
// placeholder box (`placeholder`) for a mockup that's still to be added.
export type StoryMedia = {
  image?: string;
  images?: string[];
  video?: string;
  media?: MediaKind;
  placeholder?: string;
  caption?: string;
};

// A sub-point within a story section (e.g. one research method, one solution part).
// `bullets` render as a list; **double-asterisks** mark the important phrase as bold.
export type StoryItem = {
  title?: string;
  body?: string;
  bullets?: string[];
  media?: StoryMedia;
  table?: { columns: string[]; rows: string[][] };
};

// A free-form narrative section — the building block of a richer, Medium-style
// case study (used by noon). `navLabel` drives the side nav; `eyebrow` is the
// small kicker; `heading` is the eye-catchy H2.
export type StorySection = {
  id: string;
  navLabel: string;
  eyebrow: string;
  heading?: string;
  body?: string;
  media?: StoryMedia;
  // Small bold-labelled paragraphs (e.g. Problem / Solution) shown under the heading.
  briefs?: { label: string; body: string }[];
  items?: StoryItem[];
  // When true, each item's title renders at the section-heading level (used when
  // the section itself has no heading, so items become the top-level headings).
  bigItemTitles?: boolean;
  videos?: string[];
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
  // Richer case studies use a flexible `story`; simpler ones use the fixed
  // Problem → (Outcomes) → Solution → (Experiments) → Process structure below.
  story?: StorySection[];
  problem?: {
    heading: string;
    body: string;
    points: ProblemPoint[];
    media?: MediaKind;
    image?: string;
    images?: string[];
  };
  outcomes?: { heading: string; body: string; metrics: Metric[] };
  solution?: { heading: string; body: string; sections: DetailSection[] };
  experiments?: { heading: string; body: string; videos?: string[] };
  process?: {
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
    title: "Designing an AI-assisted review flow to add a review in seconds",
    overview:
      "A walkthrough of how we redesigned noon's review-submission flow: from digging into why almost nobody writes reviews, to shipping an AI-assisted flow that turns a few taps into a finished review.",
    collaborators: [
      "Abdelrahman Baher (PM)",
      "Siddhant Ghosh (SPD)",
      "Saransh Rawat (MD)",
    ],
    hero: { video: "/work/noon/ai-1.mp4" },
    story: [
      {
        id: "context",
        navLabel: "Context",
        eyebrow: "Context",
        bigItemTitles: true,
        items: [
          {
            title: "What is noon?",
            body: "noon is the Middle East's homegrown online marketplace, selling everything from electronics and fashion to daily groceries, and serving millions of shoppers across Saudi Arabia, UAE, and Egypt.",
            media: { image: "/work/noon/noon-cover.jpeg" },
          },
          {
            title: "Why redesign the reviews & ratings flow?",
            bullets: [
              "Reviews are the closest thing to **picking an item up in a store**; they build the trust that turns a browse into a buy.",
              "They **flag weak catalog** before ops ever does.",
              "They **feed the ranking** that surfaces good products to shoppers.",
              "**Photo and text reviews** carry the most weight: shoppers who reach a review convert about **59% more often** than those who don't.",
              "But **almost nobody writes them**: only about **1 in 69 shoppers** who views a product leaves a review (~1.46%), a rate that barely moves day to day.",
            ],
          },
        ],
      },
      {
        id: "research",
        navLabel: "Getting started",
        eyebrow: "Getting started",
        heading: "Figuring out why nobody writes",
        body: "Before touching a single pixel, we wanted to understand the drop-off, so we looked outward at how other apps do it, inward at what our shoppers were telling us, and hard at the data to name the real blocker.",
        items: [
          {
            title: "What the best apps do differently",
            body: "Inside e-commerce, there was barely any innovation to borrow: across **Amazon**, **Myntra**, and **Meesho**, every review flow looked more or less the same, a star rating, a blank text box, and an add-photos container.\n\nThe fresh thinking was elsewhere. Apps like **Bolt**, **AllTrails**, and **TripAdvisor** break a review into a few tappable questions instead of a blank page, and that guided-prompt approach is what we set out to bring to noon.",
            media: {
              image: "/work/noon/competitive.png",
            },
          },
          {
            title: "What shoppers actually told us",
            body: "When we talked to friends and people on the team, the same feedback kept surfacing: they just don't write reviews. From their point of view it's a **high-effort, low-impact** task, a lot of typing for little payoff, so the intent to help never turns into an actual review.",
          },
          {
            title: "Naming the real blocker",
            body: "It was the blank text box: writing feels like real effort, because very few people are comfortable putting their thoughts into words.",
          },
        ],
      },
      {
        id: "solution",
        navLabel: "The idea",
        eyebrow: "The problem & the idea",
        briefs: [
          {
            label: "Problem",
            body: "Most shoppers rate but never write, because a full review feels like effort. So the photo-and-text reviews that actually sell rarely get created.",
          },
          {
            label: "Solution",
            body: "Make writing feel like tapping. Shoppers pick a few rating-aware chips and AI turns them into a real, first-person review they can post in seconds.",
          },
        ],
        items: [
          {
            title: "Rating-aware question chips",
            body: "Eight parameters, split by the rating you give: all positives at 5 stars, all improvements at 1, a mix in between. You just tap what fits; there's no blank page to stare at.",
            table: {
              columns: ["Star rating", "What went well?", "What could have been better?"],
              rows: [
                ["5", "8 chips", "None"],
                ["4", "6 chips", "2 chips"],
                ["3", "4 chips", "4 chips"],
                ["2", "2 chips", "6 chips"],
                ["1", "None", "8 chips"],
              ],
            },
            media: {
              image: "/work/noon/rating-states.png",
              caption: "The same 8 parameters, split by rating (5★ → 1★)",
            },
          },
          {
            title: "One tap to generate the review",
            body: "Hit Generate and AI turns your taps into a first-person review that you can post as-is, tweak a line, or add photos to. Editing a ready draft beats writing from scratch, so far more people carry it through.",
            media: {
              image: "/work/noon/generate.png",
              caption: "From picks to a first-person review: post, tweak, or add photos",
            },
          },
        ],
      },
      {
        id: "experiments",
        navLabel: "AI Experiments",
        eyebrow: "AI Experiments",
        heading: "Three ways to edit the draft",
        body: "A generated draft is only useful if editing it feels effortless; otherwise we've just moved the blank page. So instead of guessing, we prototyped three different editing patterns as working React screens with the help of Claude, and put them in front of stakeholders to feel which one flowed best before committing.",
        videos: [
          "/work/noon/exp-1.mp4",
          "/work/noon/exp-2.mp4",
          "/work/noon/exp-3.mp4",
        ],
      },
      {
        id: "process",
        navLabel: "Process",
        eyebrow: "Process",
        heading: "A design system, heading into testing",
        body: "To keep the whole flow consistent as it scales, we built a design system behind it: chips, toggles, AI states, photo-upload states, and review cards. Every screen ships from the same parts, so the experience stays coherent as the feature grows. It's in development now, heading into usability testing.",
        media: {
          images: ["/work/noon/system.png"],
        },
      },
    ],
  },
  {
    slug: "ambitio",
    company: "Ambitio",
    year: "2025",
    role: "Product Designer Intern",
    title: "Rebuilding Ambitio's dashboard to drive 14% more adoption",
    overview:
      "Ambitio helps students applying abroad go from 'where do I even start' to a submitted application. I redesigned the core dashboard end-to-end (the flow where students discover programs, track applications, and prepare their documents), turning a dense, feature-heavy product into a clear, guided journey.",
    collaborators: [],
    hero: { image: "/work/ambitio/manage-applications.png" },
    problem: {
      heading: "The product held everything, but told no clear story",
      body: "Applying abroad means juggling dozens of programs, documents, deadlines, and scholarships. Ambitio had grown feature by feature, so all that data lived in the product but with no clear hierarchy or next step. Screens were dense and generic, statuses were unclear, and students still fell back to spreadsheets and WhatsApp, which is exactly why the dashboard was underused.",
      points: [
        {
          title: "Dense, generic screens",
          body: "Detail pages had bloated over time and data points were generic, so students couldn't quickly judge fit, or even tell what was clickable.",
        },
        {
          title: "No single source of truth",
          body: "Application statuses, deadlines, and required documents lived in different places, so a student could never see, at a glance, where each application actually stood.",
        },
        {
          title: "Documents stalled in limbo",
          body: "SOPs, LORs, and essays had no clear owner or status, so work quietly stalled and nobody knew what was blocking a submission.",
        },
      ],
    },
    outcomes: {
      heading: "One clear journey, and a dashboard students return to",
      body: "Restructuring the product around the applicant's real journey (discover, apply, prepare, fund) moved the metrics that mattered.",
      metrics: [
        { value: "+14%", label: "Dashboard weekly-active adoption" },
        { value: "2.3×", label: "Faster to the next action" },
        { value: "−30%", label: "'What do I do next?' support queries" },
      ],
    },
    solution: {
      heading: "Rebuild the product around the applicant's journey",
      body: "Instead of a pile of features, I organised everything into four clear steps (discover, apply, prepare documents, and fund), and gave every screen an obvious status and next action.",
      sections: [
        {
          title: "1 · Discover programs you're actually eligible for",
          body: "Course Finder surfaces programs with the few things that drive a decision (ranking, tuition, acceptance rate, deadline, and a clear 'Eligible' tag), so students shortlist with confidence. Program detail pages lead with those decision-drivers instead of a wall of generic data.",
          images: [
            "/work/ambitio/course-finder.png",
            "/work/ambitio/course-detail.png",
          ],
          caption: "Course Finder and program detail: decision-drivers up front",
        },
        {
          title: "2 · One dashboard for every application",
          body: "Manage Applications puts every program in a single view with its status (Not started → In progress → Submitted → Accepted), target deadline, documents required, and a progress bar, so students always know exactly where each application stands and what's left to do.",
          images: [
            "/work/ambitio/manage-applications.png",
            "/work/ambitio/application-detail.png",
          ],
          caption: "Status, deadline, documents, and progress, all in one place",
        },
        {
          title: "3 · Documents that move, not pile up",
          body: "Document Manager gives every SOP, LOR, and essay a clear owner and status (Writer assigned, Need review, Completed), so nothing stalls silently and students can see what's blocking a submission.",
          image: "/work/ambitio/document-manager.png",
          caption: "Every document organised by a clear, honest status",
        },
        {
          title: "4 · Funding, surfaced instead of searched",
          body: "Scholarship Finder brings relevant scholarships (amount, deadline, type, and country) into the same flow, so funding stops being a separate, forgotten task.",
          image: "/work/ambitio/scholarship-finder.png",
          caption: "Relevant scholarships, right inside the application flow",
        },
      ],
    },
    process: {
      heading: "A system behind the screens",
      body: "To keep 8+ surfaces consistent as the product kept growing, I built a shared component system (buttons, tabs, notifications, statuses, and steppers) so every new feature ships on-brand and predictable, and the whole product reads as one coherent journey.",
      images: ["/work/ambitio/components.png"],
      note: "",
    },
  },
  {
    slug: "fibr",
    company: "Fibr.ai",
    year: "2025",
    role: "Product Designer (Contract)",
    title: "A Framer CMS that scaled Fibr.ai's traffic by 35%",
    overview:
      "At Fibr.ai, I led the design and development of their complete website infrastructure built on Framer, including agent-specific pages for Liv, Max, and Aya, and a scalable CMS for conversion rate optimization across all 50 US states.",
    collaborators: [],
    hero: { image: "/work/fibr/cro-agency.png" },
    problem: {
      heading: "Scaling a CRO web presence across 50 states, without the maintenance overhead",
      body: "Fibr.ai needed a web presence that could target diverse geographic markets while holding to CRO best practices. It had to support multiple AI-agent pages with dynamic content and deliver localized experiences across all 50 US states, all without ballooning into an unmaintainable pile of pages.",
      points: [
        {
          title: "50 states, one team",
          body: "Every state needed its own localized, SEO-ready page. Hand-building and maintaining those manually would have been impossible for a lean team.",
        },
        {
          title: "Three distinct AI agents",
          body: "Liv, Max, and Aya each needed a conversion-optimized page with its own story and interactive elements, while still feeling like one coherent product.",
        },
        {
          title: "CRO best-practices, everywhere",
          body: "Consistency mattered: every page had to follow proven conversion patterns rather than drift as new content was added.",
        },
      ],
    },
    outcomes: {
      heading: "A scalable system that compounds traffic and efficiency",
      body: "The Framer build turned a manual, design-bound process into a content-driven system, unlocking geographic reach and measurable growth.",
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
          body: "Three dedicated pages (Aya for website monitoring, Liv for ad-to-page personalization, and Max for A/B testing), each with interactive hero elements and layouts built around a clear, single conversion goal, while sharing one design language.",
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
          caption: "One system, every market, on-brand by construction",
        },
        {
          title: "A dynamic FAQ system powered by Google Sheets",
          body: "I integrated Framer CMS with Google Sheets so the FAQ section, categories and answers alike, stays dynamic and easy to maintain. Non-technical teammates update a sheet and the site follows, no redeploy required.",
          image: "/work/fibr/faq.png",
          caption: "CMS-driven FAQ, editable straight from a spreadsheet",
        },
      ],
    },
    process: {
      heading: "Key learnings",
      body: "Building this end-to-end sharpened four things: architecting for scalability from day one, integrating external data sources (Framer CMS × Google Sheets) cleanly, letting CRO principles drive design decisions, and working at the intersection of design and development to ship without a handoff.",
      note: "Designing and building in the same tool meant every CRO decision could be validated live, with no gap between the mockup and the shipped page.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
