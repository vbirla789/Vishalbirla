import type { Metadata } from "next";
import Footer from "../components/Footer";
import HeaderNav from "../components/HeaderNav";
import SectionLabel from "../components/SectionLabel";
import SectionRule from "../components/SectionRule";
import { colors, t, type } from "../theme";
import { INSTALL_COMMAND, SKILLS_REPO_URL, skills } from "../lib/skills";
import CopyCommand from "./CopyCommand";

export const metadata: Metadata = {
  title: "AI Skills for Designers — Vishal Birla",
  description:
    "Skills for coding agents: paste a Figma link, get a prototype that matches the design 1:1 and feels native on a real phone.",
  openGraph: {
    title: "AI Skills for Designers",
    description: "Paste a Figma link, get a prototype that matches the design 1:1 and feels native on a real phone.",
    images: [{ url: "/skill/og.png", width: 2560, height: 1280, alt: "Figma → Prototype" }],
  },
  twitter: { card: "summary_large_image", images: ["/skill/og.png"] },
};

/* Same lead paragraph as the homepage About: 18/28, regular, primary. */
const LEAD: React.CSSProperties = {
  ...t(type.aboutBody),
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: 400,
  color: colors.primary,
};
const BODY: React.CSSProperties = { ...t(type.aboutBody), fontWeight: 400, color: colors.secondary };

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2"
      style={{ ...t(type.aboutBody), color: colors.primary }}
    >
      <span aria-hidden>→</span>
      <span className="underline decoration-[color:var(--c-tertiary)] underline-offset-4 transition-colors group-hover:decoration-[color:var(--c-primary)]">
        {children}
      </span>
    </a>
  );
}

/* Built on the homepage's frame (header, 840px column, structure lines,
   section rules) so moving between the two feels like one site. */
export default function SkillPage() {
  return (
    <>
      <HeaderNav />
      <main className="relative mx-auto w-full max-w-[840px] px-6 pb-24 pt-14 sm:pb-32 sm:pt-[84px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-[color:var(--c-line)] min-[888px]:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-[color:var(--c-line)] min-[888px]:block"
        />

        <section className="max-w-[640px]">
          <SectionLabel>AI skills for designers</SectionLabel>
          <h1 className="font-sans" style={LEAD}>
            For designers who ship prototypes from Figma, so the prototype looks exactly like the design and feels right
            on a real phone.
          </h1>
          <div className="mt-6">
            <CopyCommand command={INSTALL_COMMAND} />
          </div>
          <p className="mt-6" style={BODY}>
            Paste a Figma link and the skill builds the prototype, then measures every screen against the Figma export
            and fixes what&apos;s off, like the padding that&apos;s 4px out or the divider that came out 2px thick, until
            it matches. Works with Claude Code and other coding agents that have the Figma MCP connected.
          </p>
          <div className="mt-6">
            <ArrowLink href={SKILLS_REPO_URL}>View on GitHub</ArrowLink>
          </div>
        </section>

        <div className="mt-14 sm:mt-[84px]">
          <SectionRule />
          <section className="max-w-[640px]">
            <SectionLabel>Available skills</SectionLabel>
            <ul className="flex flex-col gap-5">
              {skills.map((s) => (
                <li key={s.name} style={BODY}>
                  <code
                    className="mr-1.5 rounded-[5px] px-1.5 py-0.5 font-mono text-[13px]"
                    style={{ color: colors.primary, boxShadow: `inset 0 0 0 1px ${colors.line}` }}
                  >
                    {s.name}
                  </code>
                  — {s.description}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-14 sm:mt-[84px]">
          <SectionRule />
          <section className="max-w-[640px]">
            <SectionLabel>Cheatsheet</SectionLabel>
            <p style={BODY}>
              The Figma → CSS translations behind most &ldquo;almost right&rdquo; builds: auto layout, text, strokes and
              dividers, effects, phone quirks and motion. Useful for any design-to-code review, with or without the
              skill.
            </p>
            <div className="mt-6">
              <ArrowLink href={`${SKILLS_REPO_URL}/blob/main/fidelity-cheatsheet.md`}>Read the cheatsheet</ArrowLink>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
