import ContactCtas from "./components/ContactCtas";
import HeaderNav from "./components/HeaderNav";
import IntroPuzzle from "./components/IntroPuzzle";
// import TimelineWidget from "./components/TimelineWidget"; // hidden — see below
import WorkSection, { LogoMark } from "./components/WorkSection";
import { experience } from "./lib/experience";
import Footer from "./components/Footer";
import Appear from "./components/Appear";
import SectionLabel from "./components/SectionLabel";
import Typewriter from "./components/fancy/typewriter";
import { t, type } from "./theme";

export default function Home() {
  return (
    <>
      {/* Once-per-session intro game. An overlay, not a gate — the page below
          renders from first paint, so crawlers and reduced-motion users are
          untouched. Homepage only on purpose: a case study deep link should
          never make someone play a game first. */}
      <IntroPuzzle />
      <HeaderNav />
      {/* pt-16 is the 64px below the header, deliberately as PADDING: as a
          child's margin it collapsed through main and dragged the whole box —
          vertical structure lines included — 64px below the header hairline
          they're meant to hang from. */}
      <main className="relative mx-auto w-full max-w-[800px] px-6 pb-24 pt-16 sm:pb-32">
        {/* Vertical structure lines framing the column, per the Arbor
            reference — they drop from the header's hairline, and every
            SectionRule crosses them with a square at the intersection.
            min-[848px]: below that the column has no outside gutter
            (800px + 2×24px), so the lines would sit at the screen edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-[color:var(--c-line)] min-[848px]:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-[color:var(--c-line)] min-[848px]:block"
        />
        {/* Timeline widget (Bengaluru clock + photo strip) — hidden for now.
            Nothing links to #intro, so there are no dead anchors. To restore,
            uncomment this block and its import at the top of the file. */}
        {/*
        <Appear delay={0.35}>
          <div id="intro" className="scroll-mt-28">
            <TimelineWidget />
          </div>
        </Appear>
        */}

        {/* about / intro */}
        {/* No SectionRule here on purpose: the header's own bottom hairline
            already sits directly above this section and carries the squares,
            so adding one would draw a second line 64px under the first. Every
            LATER section still gets its own rule. */}
        <section id="about" className="max-w-[640px] scroll-mt-28">
          {/* name appears first */}
          <Appear>
            <SectionLabel>About</SectionLabel>
            {/* min-height reserves the tallest line so the paragraph below
                doesn't jump as the text types and deletes */}
            <h1
              className="min-h-[1.2em] text-[color:var(--c-primary)]"
              style={{
                ...t(type.headline),
                fontSize: "clamp(1.75rem, 5vw, 2rem)",
                lineHeight: 1.2,
                cursor: "default",
              }}
            >
              {/* The typed text starts empty, so on its own this h1 is blank in
                  the server HTML — bad for search engines and screen readers.
                  The real heading is here and hidden visually; the animation is
                  decorative and marked aria-hidden. */}
              <span className="sr-only">Vishal Birla — Product Designer</span>
              <span aria-hidden="true">
                <Typewriter
                  as="span"
                  /* Short noun-phrase labels, opening with the name so the
                     first pass reads as an introduction.
                     Every line is kept under ~21 characters on purpose: at the
                     28px mobile size the h1 only has 327px, and a line that
                     wraps adds a second row that shifts the whole page down by
                     34px each time the cycle reaches it. Measure before adding
                     a longer one. */
                  text={[
                    "This is Vishal",
                    "Designer who builds",
                    "Coffee enthusiast",
                    "2px negotiator",
                  ]}
                  speed={70}
                  deleteSpeed={40}
                  waitTime={2200}
                  cursorChar="_"
                  cursorClassName="ml-1 text-[color:var(--c-accent)]"
                />
              </span>
            </h1>
          </Appear>

          {/* description */}
          <Appear delay={0.14}>
            <div className="mt-4 space-y-4">
              <p className="w-full max-w-[576px]" style={{ ...t(type.aboutBody), fontWeight: 400 }}>
                Product designer based in India, currently working at
                <span className="font-semibold text-[color:var(--c-primary)]"> noon</span>.
                I love using AI to shape designs and bring them to life as living, interactive experiences.
              </p>
            </div>
            <ContactCtas />
          </Appear>

          {/* crafted experiences at — client / company logos */}
          <Appear delay={0.26}>
            <div className="mt-9">
              <SectionLabel>Crafted experiences at</SectionLabel>
              {/* app-icon marks, reusing the same list the Experience section
                  renders so the two can never drift apart */}
              <div className="flex flex-wrap items-center gap-4">
                {experience.map((e) => (
                  <LogoMark key={e.company} src={e.logo} alt={e.company} />
                ))}
              </div>
            </div>
          </Appear>
        </section>

        {/* work / experience / fun / resume */}
        {/* mt-16 to match the section spacing inside WorkSection — About sits
            out here, so this gap is the one above the Work rule. */}
        <div className="mt-16">
          <WorkSection />
        </div>

        {/* footer */}
        <Appear inView>
          <Footer />
        </Appear>
      </main>
    </>
  );
}
