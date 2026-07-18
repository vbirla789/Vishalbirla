/* ----------------------------------------------------------------------------
 * Case-study content for the Work section detail pages.
 * All copy here is placeholder / dummy — swap for real narrative + assets later.
 * Structure mirrors a strong case study: Problem → Outcomes → Solution → Process.
 * --------------------------------------------------------------------------*/

export type Metric = { value: string; label: string };
export type ProblemPoint = { title: string; body: string };

export type MediaKind = "phone" | "panel" | "duo" | "chart" | "photos";
export type DetailSection = {
  title: string;
  body: string;
  media: MediaKind;
  caption?: string;
};

export type Project = {
  slug: string;
  company: string;
  year: string;
  role: string;
  title: string;
  overview: string;
  collaborators: string[];
  problem: { heading: string; body: string; points: ProblemPoint[] };
  outcomes: { heading: string; body: string; metrics: Metric[] };
  solution: { heading: string; body: string; sections: DetailSection[] };
  process: { heading: string; body: string; note: string };
};

export const projects: Project[] = [
  {
    slug: "ambitio",
    company: "Ambitio",
    year: "2025",
    role: "Product Designer — end-to-end",
    title: "Driving 14% dashboard adoption through a strategic UX redesign",
    overview:
      "Rebuilt Ambitio's postgraduate application platform into a decision-making engine — turning a static status tracker into a dashboard that thousands of learners open every day to know exactly what to do next.",
    collaborators: ["Priya Nair", "Rahul Mehta", "Sana Iqbal"],
    problem: {
      heading: "The dashboard told users what happened, not what to do",
      body: "By early 2025, the dashboard was the least-used surface in the product despite being the default landing screen. Learners bounced to WhatsApp and email to figure out their next step — the exact opposite of what a dashboard should do.",
      points: [
        {
          title: "Everything looked equally important",
          body: "Deadlines, essays, mentor notes and payments all shared the same visual weight, so nothing stood out. Users scanned, felt overwhelmed, and left.",
        },
        {
          title: "No sense of progress",
          body: "There was no clear signal of how far along an application was, so learners couldn't tell whether they were on track or falling behind.",
        },
        {
          title: "Actions were buried two taps deep",
          body: "The one thing a user came to do — submit the next task — sat inside nested menus, adding friction at the exact moment intent was highest.",
        },
      ],
    },
    outcomes: {
      heading: "A dashboard people actually return to",
      body: "Within seven weeks of rollout, the redesign moved the metrics that mattered — adoption, task completion, and time-to-next-action.",
      metrics: [
        { value: "+14%", label: "Dashboard weekly active adoption" },
        { value: "2.3×", label: "Faster to the next action" },
        { value: "−31%", label: "Support tickets about 'what's next'" },
      ],
    },
    solution: {
      heading: "Make the next best action impossible to miss",
      body: "We rebuilt the dashboard around a single question: what should this learner do right now? Everything else became supporting context.",
      sections: [
        {
          title: "A priority stack, not a list",
          body: "The redesign replaces the flat list with a prioritised stack that surfaces the single most urgent task at the top, with upcoming items collapsing neatly beneath it. Deadlines drive the order automatically, so learners never sort anything themselves.",
          media: "phone",
          caption: "Priority stack — the urgent task always sits on top",
        },
        {
          title: "Progress you can feel",
          body: "A glanceable progress meter gives learners an honest read on how far along each application is. Milestones light up as they're completed, turning a stressful process into a series of small, motivating wins.",
          media: "panel",
          caption: "Milestone progress across every application",
        },
        {
          title: "One tap to act",
          body: "Primary actions were pulled out of nested menus and onto the card itself. Submitting a task, booking a mentor, or paying a fee now takes a single, obvious tap at the moment of intent.",
          media: "duo",
        },
      ],
    },
    process: {
      heading: "Testing & rollout",
      body: "We shipped behind a flag to 5% of learners, ran moderated sessions with first-generation applicants, and iterated on the priority logic three times before the full rollout.",
      note: "The hardest part was tuning the ranking — early versions felt 'nagging' until we let users snooze non-urgent items.",
    },
  },
  {
    slug: "fibr",
    company: "Fibr.ai",
    year: "2025",
    role: "Product Designer (Contract)",
    title: "Driving 35% traffic growth through a strategic CMS design in Framer",
    overview:
      "Designed and built Fibr.ai's web presence as a scalable CMS in Framer — a system that let a small marketing team ship localized landing pages across 50 states without a designer in the loop.",
    collaborators: ["Devon Clark", "Aisha Rahman"],
    problem: {
      heading: "Every new landing page needed a designer",
      body: "Fibr.ai wanted to rank in 50 states, but each localized page was hand-built. Growth was capped by design bandwidth, and pages drifted off-brand the moment the team moved fast.",
      points: [
        {
          title: "No reusable system",
          body: "Sections were copy-pasted between pages, so a single brand change meant editing dozens of files by hand.",
        },
        {
          title: "Marketers were blocked on design",
          body: "Publishing a new state page required a designer, turning a 30-minute content task into a multi-day queue.",
        },
        {
          title: "Inconsistent, slow pages",
          body: "Ad-hoc pages shipped with heavy assets and mismatched spacing, hurting both Core Web Vitals and conversion.",
        },
      ],
    },
    outcomes: {
      heading: "A system that scales without a designer",
      body: "The CMS turned page creation into a content task and unlocked the state-by-state expansion the growth team had planned.",
      metrics: [
        { value: "+35%", label: "Organic traffic growth" },
        { value: "50", label: "State pages shipped from one system" },
        { value: "−20%", label: "Customer acquisition cost" },
      ],
    },
    solution: {
      heading: "Componentize the whole marketing site",
      body: "We broke the site into a library of CMS-driven sections that marketers assemble like blocks — every one on-brand by construction.",
      sections: [
        {
          title: "A block library anyone can use",
          body: "Heroes, feature grids, testimonials and CTAs became configurable Framer components bound to CMS fields. A marketer builds a full page by picking blocks and filling in copy — no layout decisions required.",
          media: "panel",
          caption: "The section library, driven entirely by CMS content",
        },
        {
          title: "Localization built in",
          body: "State, city and keyword fields flow into every block automatically, so one template renders 50 unique, SEO-ready pages. Update the template once and every page updates with it.",
          media: "phone",
          caption: "One template, fifty localized outputs",
        },
        {
          title: "Fast by default",
          body: "Responsive rules, image optimization and consistent spacing are baked into the components, so every published page is fast and pixel-consistent without anyone thinking about it.",
          media: "duo",
        },
      ],
    },
    process: {
      heading: "Testing & rollout",
      body: "We piloted with five state pages, measured Core Web Vitals and conversion against the old hand-built pages, then handed the system to the marketing team with a short playbook.",
      note: "The biggest unlock was governance — locking layout while opening up content kept 50 pages on-brand.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
