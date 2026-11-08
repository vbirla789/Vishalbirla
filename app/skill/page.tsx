import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
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

/* Page body copy: the 16px body token, regular weight, secondary tone. */
const BODY: React.CSSProperties = { ...t(type.aboutBody), fontWeight: 400, color: colors.secondary };
const HEADING: React.CSSProperties = { ...t(type.projectTitle), fontSize: "16px", lineHeight: "24px" };

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

export default function SkillPage() {
  return (
    <main className="relative mx-auto w-full max-w-[640px] px-6 pb-16 pt-20 sm:pt-[120px]">
      <header>
        <Link href="/" className="block w-fit" style={{ ...t(type.projectTitle), fontSize: "16px", lineHeight: "24px" }}>
          Vishal Birla
        </Link>
        <p style={{ ...BODY, color: colors.tertiary }}>Product Designer</p>
      </header>

      <section className="mt-20 sm:mt-[120px]">
        <h1 style={HEADING}>AI Skills for Designers</h1>
        <p className="mt-4" style={BODY}>
          For designers who ship prototypes from Figma, so the prototype looks exactly like the design and feels right
          on a real phone.
        </p>
        <div className="mt-6">
          <CopyCommand command={INSTALL_COMMAND} />
        </div>
        <p className="mt-8" style={BODY}>
          Paste a Figma link and the skill builds the prototype, then measures every screen against the Figma export and
          fixes what&apos;s off, like the padding that&apos;s 4px out or the divider that came out 2px thick, until it
          matches. Works with Claude Code and other coding agents that have the Figma MCP connected.
        </p>
        <div className="mt-6">
          <ArrowLink href={SKILLS_REPO_URL}>View on GitHub</ArrowLink>
        </div>
      </section>

      <section className="mt-20 sm:mt-24">
        <h2 style={HEADING}>Available Skills</h2>
        <ul className="mt-5 flex flex-col gap-5">
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

      <section className="mt-20 sm:mt-24">
        <h2 style={HEADING}>Cheatsheet</h2>
        <p className="mt-4" style={BODY}>
          The Figma → CSS translations behind most &ldquo;almost right&rdquo; builds: auto layout, text, strokes and
          dividers, effects, phone quirks and motion. Useful for any design-to-code review, with or without the skill.
        </p>
        <div className="mt-6">
          <ArrowLink href={`${SKILLS_REPO_URL}/blob/main/fidelity-cheatsheet.md`}>Read the cheatsheet</ArrowLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}
