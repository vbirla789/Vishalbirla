import ContactCtas from "./components/ContactCtas";
import HeaderNav from "./components/HeaderNav";
import IntroPuzzle from "./components/IntroPuzzle";
// import PhotoStrip from "./components/PhotoStrip"; // hidden — see below
import WorkSection, { LogoMark } from "./components/WorkSection";
import { experience } from "./lib/experience";
import Footer from "./components/Footer";
import Appear from "./components/Appear";
import SectionLabel from "./components/SectionLabel";
import { colors, t, type } from "./theme";

/* The About paragraphs, hoisted because both carry it identically and drifting
   apart would be invisible until someone noticed one line reading heavier.

   Overridden here rather than in the token: aboutBody is 16px and shared with
   the case study body, which is staying where it is. Primary rather than the
   token's secondary too — with no portrait or name above them, these carry the
   section alone. */
const ABOUT_PARAGRAPH: React.CSSProperties = {
  ...t(type.aboutBody),
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: 400,
  color: colors.primary,
};

export default function Home() {
  return (
    <>
      {/* Once-per-session intro game. An overlay, not a gate — the page below
          renders from first paint, so crawlers and reduced-motion users are
          untouched. Homepage only on purpose: a case study deep link should
          never make someone play a game first. */}
      <IntroPuzzle />
      <HeaderNav />
      {/* The space below the header, deliberately as PADDING: as a child's
          margin it collapsed through main and dragged the whole box — vertical
          structure lines included — that far below the header hairline they're
          meant to hang from.

          56px on phones against 84px from sm up. The desktop figure is a lot
          of empty screen on a 375px-wide viewport, where there is far less
          width for the eye to travel and the gap reads as a gulf. */}
      <main className="relative mx-auto w-full max-w-[840px] px-6 pb-24 pt-14 sm:pb-32 sm:pt-[84px]">
        {/* Vertical structure lines framing the column, per the Arbor
            reference — they drop from the header's hairline, and every
            SectionRule crosses them with a square at the intersection.
            min-[888px]: below that the column has no outside gutter
            (840px + 2×24px), so the lines would sit at the screen edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-[color:var(--c-line)] min-[888px]:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-[color:var(--c-line)] min-[888px]:block"
        />
        {/* Photo strip (the clock-driven filmstrip) — hidden for now. Nothing
            in the nav links to #intro, so there are no dead anchors. To bring
            it back, uncomment this block and its import at the top of the
            file, exactly as the timeline widget used to be parked. */}
        {/*
        <Appear>
          <div id="intro" className="mb-9 scroll-mt-28">
            <PhotoStrip />
          </div>
        </Appear>
        */}

        {/* about / intro */}
        {/* No SectionRule here on purpose: the header's own bottom hairline
            already sits directly above this section and carries the squares,
            so adding one would draw a second line 64px under the first. Every
            LATER section still gets its own rule. */}
        <section id="about" className="max-w-[640px] scroll-mt-28">
          {/* greeting */}
          <Appear>
            {/* The page's only h1, and the section's own label — which is why
                there's no SectionLabel above it the way later sections have
                one. It instead reads aboutLabel, the very token SectionLabel
                uses, alongside the same font-mono and uppercase, so it renders
                identically to WORK and EXPERIENCE and can only drift from them
                if that token changes.

                font-mono also keeps it out of the Geist Pixel treatment
                @layer base gives every heading, and with it the stroke bump
                that would fake-bold a font with real weights. */}
            <h1 className="font-mono uppercase" style={t(type.aboutLabel)}>
              Hi, This is Vishal
            </h1>
          </Appear>

          {/* description */}
          <Appear delay={0.14}>
            <div className="mt-4 space-y-4">
              {/* space-y-4 on the wrapper sets the gap between the two.
                  Type comes from ABOUT_PARAGRAPH above.

                  No max-width of their own: the measure is the section's
                  640px, so there's one number to change rather than two that
                  can disagree. The old 576px broke "experiences." onto a third
                  line once the type went to 18px — two lines need 608px, so
                  640 clears it with room rather than sitting on the edge. */}
              <p className="w-full" style={ABOUT_PARAGRAPH}>
                Product designer based in India, currently working at
                <span className="font-semibold text-[color:var(--c-primary)]"> noon</span>.
                I love using AI to shape designs and bring them to life as living, interactive experiences.
              </p>
              <p className="w-full" style={ABOUT_PARAGRAPH}>
                Outside of work, I love playing tennis, brewing coffee and travelling.
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
        {/* Matches the section spacing inside WorkSection at both breakpoints —
            About sits out here, so this gap is the one above the Work rule. */}
        <div className="mt-14 sm:mt-[84px]">
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
