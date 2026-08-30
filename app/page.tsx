import ContactCtas from "./components/ContactCtas";
import HeaderNav from "./components/HeaderNav";
// import TimelineWidget from "./components/TimelineWidget"; // hidden — see below
import WorkSection, { LogoMark } from "./components/WorkSection";
import { experience } from "./lib/experience";
import Footer from "./components/Footer";
import Appear from "./components/Appear";
import Typewriter from "./components/fancy/typewriter";
import { t, type } from "./theme";

export default function Home() {
  return (
    <>
      <HeaderNav />
      <main className="mx-auto w-full max-w-[800px] px-6 pb-24 sm:pb-32">
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
        {/* 64px below the header — the only thing setting that gap now */}
        <section id="about" className="mt-16 max-w-[640px] scroll-mt-28">
          {/* name appears first */}
          <Appear>
            <p className="mb-4 font-mono uppercase" style={t(type.aboutLabel)}>
              About
            </p>
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
              <Typewriter
                as="span"
                text={["Vishal Birla", "Product Designer", "Framer Expert"]}
                speed={70}
                deleteSpeed={40}
                waitTime={2200}
                cursorChar="_"
                cursorClassName="ml-1 text-[color:var(--c-accent)]"
              />
            </h1>
          </Appear>

          {/* description */}
          <Appear delay={0.14}>
            <div className="mt-4 space-y-4">
              <p className="w-full max-w-[576px]" style={{ ...t(type.aboutBody), fontWeight: 400 }}>
                I&apos;m a product designer based in India, currently designing at
                <span className="font-semibold text-[color:var(--c-primary)]"> noon</span>.
                I love using AI to shape designs and bring them to life as living, interactive experiences.
              </p>
            </div>
            <ContactCtas />
          </Appear>

          {/* crafted experiences at — client / company logos */}
          <Appear delay={0.26}>
            <div className="mt-9">
              <p
                className="mb-4 font-mono uppercase"
                style={t(type.aboutLabel)}
              >
                Crafted experiences at
              </p>
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
        <div className="mt-20">
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
