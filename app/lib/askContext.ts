/* ----------------------------------------------------------------------------
 * Context for the Ask AI panel.
 *
 * This is a hand-written knowledge base with keyword matching — NOT a language
 * model. It runs entirely client-side, needs no API key, and costs nothing per
 * message, which is why the panel works today.
 *
 * TO SWAP IN A REAL MODEL: keep `PROFILE` as the system-prompt context, add an
 * /api/ask route that calls Claude with it, and replace the body of
 * `answerAbout` with a fetch to that route. The panel renders whatever
 * { text, links } it gets back, so nothing in the UI needs to change.
 * --------------------------------------------------------------------------*/

/** The factual ground truth. Also the right thing to feed a real model later. */
export const PROFILE = {
  name: "Vishal Birla",
  role: "Product Designer",
  location: "India",
  current: "noon",
  email: "vishalbirla789@gmail.com",
  site: "vishalbirla.com",
  education: [
    "Manipal University Jaipur — B.Tech in Information Technology, Aug 2022 – May 2026, GPA 8.90",
    "10k Designers — Designer in Residence, Jan 2025 – Apr 2025",
  ],
  roles: [
    "noon — Product Designer Intern, May 2026 – present",
    "Ambitio — Product Designer Intern, July 2025 – April 2026",
    "Fibr.ai — Product Designer (Contract), April 2025 – July 2025",
    "DZINR — Product Designer Intern, Jan 2025 – Mar 2025",
  ],
  skills: {
    design:
      "UX design, UI design, interaction design, design systems, wireframing, prototyping, user flows, information architecture",
    research:
      "user research, journey mapping, usability testing, accessibility, product thinking",
    frontend: "HTML, CSS, JavaScript, TypeScript, React, Next.js, SwiftUI",
    tools: "Figma, Framer, ChatGPT, Claude, Midjourney, Canva",
  },
};

/**
 * A link offered alongside an answer.
 * `href` starting with "#" is a section on the homepage — the panel scrolls to
 * it and closes. Anything else is a route or external URL.
 */
export type AnswerLink = { label: string; href: string };
export type Answer = { text: string; links?: AnswerLink[] };

/* Reused so a renamed route only changes in one place. */
const CASE = {
  noon: { label: "Read the noon case study", href: "/work/noon" },
  ambitio: { label: "Read the Ambitio case study", href: "/work/ambitio" },
  fibr: { label: "Read the Fibr.ai case study", href: "/work/fibr" },
};
const SECTION = {
  work: { label: "See the work", href: "#work" },
  experience: { label: "Full experience", href: "#experience" },
  concepts: { label: "Concepts", href: "#fun" },
  about: { label: "About me", href: "#about" },
};

type Entry = { keywords: string[]; answer: Answer };

/* Ordered most-specific first — the highest keyword score wins. */
const ENTRIES: Entry[] = [
  {
    keywords: [
      "strongest",
      "best project",
      "proudest",
      "favourite project",
      "favorite project",
      "favourite work",
      "favorite work",
    ],
    answer: {
      text: "The noon review flow. Almost nobody writes product reviews — people rate but never write, because a blank text box feels like work. I redesigned it around the gesture shoppers already make: tap. You pick a few rating-aware chips and AI turns them into a real review you can post in seconds. It's my strongest piece because the insight and the interaction are the same idea.",
      links: [CASE.noon, SECTION.work],
    },
  },
  {
    keywords: ["noon review", "review flow", "review submission", "ai-assisted review", "chips"],
    answer: {
      text: "At noon I redesigned the AI-assisted review submission flow end to end. The problem was that writing feels like effort, so the reviews that actually sell rarely get created. The solution keeps the whole flow tap-based: rating-aware question chips, then AI drafts a real review from those picks, which the shopper can edit and post.",
      links: [CASE.noon],
    },
  },
  {
    keywords: ["image-first", "image first", "ugc", "navigation experience"],
    answer: {
      text: "I redesigned the Image-First Navigation experience for noon's UGC segment — a story-style viewer for browsing user photos and reviews, aimed at improving content discovery and pushing conversion.",
      links: [CASE.noon, SECTION.experience],
    },
  },
  {
    keywords: ["design system", "field design system", "components", "tokens"],
    answer: {
      text: "At noon I build reusable components for the Field Design System — product cards, toasts, tooltips, section headers and other scalable patterns. I also built a design system at Ambitio and handed it off to developers.",
      links: [SECTION.experience, CASE.ambitio],
    },
  },
  {
    keywords: ["ambitio", "nova", "study abroad"],
    answer: {
      text: "At Ambitio I designed the NOVA dashboard for students applying to universities abroad — modules for profile building, goal tracking and university discovery. I ran the user research, turned it into flows and wireframes, and built a scalable design system for handoff. The dashboard rebuild drove about 14% more adoption.",
      links: [CASE.ambitio],
    },
  },
  {
    keywords: ["fibr", "saas", "onboarding", "authentication", "seo"],
    answer: {
      text: "At Fibr.ai I designed and built key dashboard interfaces for their SaaS platform, plus the authentication and onboarding screens. I also worked on their marketing site in Framer, which improved performance, SEO and content management — traffic grew around 35%.",
      links: [CASE.fibr],
    },
  },
  {
    keywords: ["dzinr", "dzinr website"],
    answer: {
      text: "At DZINR I redesigned and shipped their website using Figma and Framer, working with a marketing team to keep a consistent brand identity. Framer's prototyping let us move much faster on delivery.",
      links: [SECTION.experience],
    },
  },
  {
    keywords: ["code", "develop", "frontend", "engineer", "react", "next", "swiftui", "technical"],
    answer: {
      text: `I design and I ship. On the design side: ${PROFILE.skills.design}. On the code side: ${PROFILE.skills.frontend}. That means I hand off designs that are realistic to build, and often build them myself — this portfolio is Next.js, and I've written a native SwiftUI app too.`,
      links: [SECTION.concepts, SECTION.work],
    },
  },
  {
    keywords: ["ai", "how do you use ai", "workflow", "claude", "chatgpt"],
    answer: {
      text: "AI is part of how I work, not a bolt-on. I use it to explore directions fast, to draft and pressure-test copy, and to build working prototypes rather than static mockups — so a design can be judged by using it. The noon review flow is AI in the product itself; this site and its prototypes are AI in the process.",
      links: [CASE.noon, SECTION.concepts],
    },
  },
  {
    keywords: ["about you", "yourself", "who are you", "intro", "background", "tell me about"],
    answer: {
      text: `I'm ${PROFILE.name}, a product designer based in ${PROFILE.location}, currently designing at ${PROFILE.current}. I came in through a development background, so I think about how things get built as much as how they look. I like using AI to shape designs and bring them to life as living, interactive experiences rather than flat screens.`,
      links: [SECTION.about, SECTION.work],
    },
  },
  {
    keywords: ["experience", "worked", "companies", "where have you", "career", "roles"],
    answer: {
      text: `Four places so far:\n\n• ${PROFILE.roles.join("\n• ")}\n\nnoon is current — reviews, design system work, and UGC navigation.`,
      links: [SECTION.experience, CASE.noon],
    },
  },
  {
    keywords: ["skills", "what can you do", "stack", "tools", "figma"],
    answer: {
      text: `Design: ${PROFILE.skills.design}.\n\nResearch: ${PROFILE.skills.research}.\n\nFrontend: ${PROFILE.skills.frontend}.\n\nTools: ${PROFILE.skills.tools}.`,
      links: [SECTION.experience, SECTION.work],
    },
  },
  {
    keywords: ["study", "studied", "education", "college", "university", "degree", "gpa"],
    answer: {
      text: PROFILE.education.join("\n\n"),
      links: [SECTION.about],
    },
  },
  {
    keywords: ["contact", "email", "hire", "reach", "available", "resume", "cv", "freelance"],
    answer: {
      text: `Easiest is email — ${PROFILE.email}. My resume is linked from the header, and there's LinkedIn in the footer. Happy to talk about product design roles or focused freelance work.`,
      links: [
        { label: "Email me", href: `mailto:${PROFILE.email}` },
        SECTION.about,
      ],
    },
  },
  {
    keywords: ["framer"],
    answer: {
      text: "Framer is one of my main tools — I've shipped marketing sites and CMS-driven pages with it at Fibr.ai and DZINR, and I lean on its prototyping to test interactions before handing anything off.",
      links: [CASE.fibr],
    },
  },
];

const FALLBACK: Answer = {
  text: `I don't have a written answer for that one. Things I can cover: my work at noon, Ambitio, Fibr.ai and DZINR; the noon review flow in detail; my design and frontend skills; how I use AI; or how to get in touch.`,
  links: [SECTION.work, SECTION.experience],
};

/**
 * Match a question against the knowledge base.
 * Scores by how many keywords hit, so "tell me about the noon review flow"
 * resolves to the review-flow entry rather than the generic intro.
 */
export function answerAbout(question: string): Answer {
  const q = question.toLowerCase().trim();
  if (!q) return FALLBACK;

  let best: { score: number; answer: Answer } | null = null;

  for (const entry of ENTRIES) {
    let score = 0;
    for (const k of entry.keywords) {
      if (q.includes(k)) score += k.includes(" ") ? 3 : 1; // phrases beat single words
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  return best ? best.answer : FALLBACK;
}
