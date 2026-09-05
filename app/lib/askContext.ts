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
    frontend: "HTML, CSS, JavaScript, TypeScript, React, React Native, Next.js, Redux, Tailwind, Vite, Shadcn UI, SwiftUI",
    backend: "Node, Express, MongoDB/Mongoose, Firebase, Convex, Clerk, Auth0, OAuth",
    web3: "Solidity, Hardhat, Ethers, Ganache",
    tools: "Figma, Framer (including CMS), Vercel, Render, Postman",
    ai: "ChatGPT, Claude, Midjourney, Relume, UxPilot, Whimsical, Gamma, Fibr.ai",
  },

  /** The one-line pitch. Everything else is evidence for this. */
  differentiator:
    "product design plus development — able to frame the problem, design the UX/UI, prototype it quickly, and hold a real conversation with engineers about constraints",

  strengths:
    "product design, UX/UI, design systems, Framer, landing pages, rapid prototyping, AI-assisted design workflows, design engineering",

  /* Beyond the four case-study roles above — asked about often enough to be
     worth naming, but not detailed enough to deserve their own answers. */
  alsoWorkedWith: [
    "Supergrow", "SauceAudio", "Proquity", "BigWigMedia.ai", "Smollan",
    "AccioJob", "Unoptimised Studio", "Vizuals Design Studio", "Webveda",
    "Yuake", "OR (Originally Raw)", "Schoolio",
  ],

  lookingFor:
    "product design roles, startups, AI products, design engineering, Framer and landing-page work",
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
  /* Must sit above the generic "experience" entry. These are proper nouns
     worth 1 point each, and "has he worked with schoolio" also scores 1 on
     that entry's "worked" — on a tie the earlier entry wins, so the specific
     one has to come first. */
  {
    keywords: [
      "other companies", "other clients", "who else", "supergrow", "sauceaudio",
      "proquity", "bigwig", "smollan", "acciojob", "unoptimised", "vizuals",
      "webveda", "yuake", "schoolio", "originally raw", "brands",
    ],
    answer: {
      text: `Beyond the four roles with case studies, I've worked across ${PROFILE.alsoWorkedWith.join(", ")}.\n\nMostly product design, landing pages and Framer builds — a lot of it 0→1 and fast.`,
      links: [SECTION.experience, SECTION.work],
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
      text: `AI is part of how I work, not a bolt-on. I use it to explore directions fast, to draft and pressure-test copy, and to build working prototypes rather than static mockups — so a design can be judged by using it. The tools: ${PROFILE.skills.ai}.\n\nThe belief underneath it: AI should accelerate the design work, not replace the product thinking. The noon review flow is AI inside the product; this site and its prototypes are AI in the process.`,
      links: [CASE.noon, SECTION.concepts],
    },
  },
  {
    /* No "tell me about" here: it's a conversational prefix, not a topic, and
       as a 3-point phrase it hijacked "tell me about <anything specific>".
       "about you" still catches "tell me about yourself". */
    keywords: ["about you", "yourself", "who are you", "intro", "background"],
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
      text: `Design: ${PROFILE.skills.design}.\n\nResearch: ${PROFILE.skills.research}.\n\nFrontend: ${PROFILE.skills.frontend}.\n\nTools: ${PROFILE.skills.tools}.\n\nAI: ${PROFILE.skills.ai}.`,
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

  /* ---- the "should we hire him" cluster -----------------------------------
   * Deliberately phrase-heavy. The generic contact entry already owns the
   * bare word "hire" ("how do I hire you"), so this one keys off "hiring"
   * and the why-questions instead, and wins on phrase score when someone is
   * actually asking for the pitch. */
  {
    keywords: [
      "worth hiring", "why hire", "should i hire", "should we hire",
      "why should", "good hire", "right fit", "good fit", "why you",
      "convince me", "sell me", "hiring",
    ],
    answer: {
      text: "Short version: I design it, then I build it. Most designers hand over a file — I hand over the file, a working prototype, and the ability to talk to engineers in their own language. Less gets lost between the design and the thing that ships.\n\nThe evidence: at noon I'm on AI-assisted reviews, image-first UGC navigation and the Field Design System. At Ambitio the NOVA dashboard rebuild lifted adoption ~14%. At Fibr.ai the site I designed and built in Framer grew traffic ~35%.",
      links: [SECTION.work, CASE.noon, { label: "Email me", href: `mailto:${PROFILE.email}` }],
    },
  },
  {
    keywords: [
      "differentiator", "different from", "stand out", "what makes you",
      "unique", "strength", "strong suit", "best at", "superpower",
    ],
    answer: {
      text: `My differentiator is ${PROFILE.differentiator}.\n\nStrongest areas: ${PROFILE.strengths}.`,
      links: [SECTION.work, SECTION.experience],
    },
  },
  {
    keywords: [
      "tech stack", "backend", "full stack", "fullstack", "node", "mongo",
      "typescript", "react native", "tailwind", "firebase", "convex",
      "database", "what do you build with",
    ],
    answer: {
      text: `Frontend: ${PROFILE.skills.frontend}.\n\nBackend: ${PROFILE.skills.backend}.\n\nDeploy and tooling: ${PROFILE.skills.tools}.\n\nI'm a designer first — the stack exists so I can build what I design rather than describe it.`,
      links: [SECTION.concepts, SECTION.work],
    },
  },
  {
    keywords: ["solidity", "web3", "blockchain", "smart contract", "ethers", "hardhat"],
    answer: {
      text: `Some, from my development background: ${PROFILE.skills.web3}. It's not where I focus now — my work is product design and design engineering — but the contract-level mental model is there if a project needs it.`,
      links: [SECTION.concepts],
    },
  },
  {
    keywords: [
      "looking for", "open to", "next role", "opportunities", "interested in",
      "what do you want", "job search", "new role",
    ],
    answer: {
      text: `Right now: ${PROFILE.lookingFor}.\n\nI like 0→1 problems, small teams that move quickly, and owning something end to end. Easiest way to start a conversation is email — ${PROFILE.email}.`,
      links: [{ label: "Email me", href: `mailto:${PROFILE.email}` }, SECTION.work],
    },
  },
  {
    keywords: [
      "how do you work", "working style", "your process", "collaborate",
      "collaboration", "work with engineers", "ownership", "communication style",
      "0 to 1", "zero to one", "startup", "early stage",
    ],
    answer: {
      text: "I like simple, polished things and I'd rather ship one considered flow than five rough ones. In practice: understand the problem, sketch fast, prototype something real, then put it in front of people.\n\nI work closely with engineering — my development background means constraints come up early rather than at handoff — and I take ownership of a problem end to end. Startups and 0→1 work suit me best.",
      links: [SECTION.work, SECTION.experience],
    },
  },
  {
    keywords: ["landing page", "marketing site", "build me a site", "website for"],
    answer: {
      text: "Landing pages are a real specialism, not a side line — I've built and shipped production marketing sites in Framer, with CMS, for Fibr.ai and DZINR. Fibr.ai's grew traffic around 35% off the back of better performance, SEO and content management.",
      links: [CASE.fibr, { label: "Email me", href: `mailto:${PROFILE.email}` }],
    },
  },
];

const FALLBACK: Answer = {
  text: `I don't have a written answer for that one. Try me on: why I'd be a good hire; what makes me different; my work at noon, Ambitio, Fibr.ai or DZINR; my design and engineering stack; how I use AI; what I'm looking for next; or how to reach me.`,
  links: [SECTION.work, SECTION.experience],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Does `q` contain `keyword` as a whole word (or whole phrase)?
 *
 * Single words are matched on word boundaries rather than as raw substrings.
 * Plain `includes` produced real misroutes: the keyword "ai" matched inside
 * "email" and "available", so "what's your email" answered the how-I-use-AI
 * question. Hyphens and punctuation still count as boundaries, so "ai" keeps
 * matching "AI-assisted".
 *
 * A trailing "s" is tolerated so "startup" matches "startups" — but this is
 * matching, not stemming, so "hire" still will not match "hiring". Where an
 * irregular form matters, list both in the keywords.
 */
function hits(q: string, keyword: string): boolean {
  if (keyword.includes(" ")) return q.includes(keyword);
  return new RegExp(`\\b${escapeRe(keyword)}s?\\b`).test(q);
}

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
      if (hits(q, k)) score += k.includes(" ") ? 3 : 1; // phrases beat single words
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  return best ? best.answer : FALLBACK;
}
