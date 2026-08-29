import ContactCtas from "./components/ContactCtas";
import SideNav from "./components/SideNav";
import TimelineWidget from "./components/TimelineWidget";
import WorkSection, { LogoMark } from "./components/WorkSection";
import { experience } from "./lib/experience";
import Footer from "./components/Footer";
import Appear from "./components/Appear";
import { t, type } from "./theme";

export default function Home() {
  return (
    <>
      <SideNav />
      <main className="mx-auto w-full max-w-[800px] px-6 pb-24 pt-20 sm:pb-32 sm:pt-32">
        {/* dynamic timeline widget — settles in after the name */}
        <Appear delay={0.35}>
          <div id="intro" className="scroll-mt-28">
            <TimelineWidget />
          </div>
        </Appear>

        {/* about / intro */}
        <section id="about" className="mt-12 max-w-[640px] scroll-mt-28 sm:mt-16">
          {/* name appears first */}
          <Appear>
            <p className="mb-4 font-mono uppercase" style={t(type.aboutLabel)}>
              About
            </p>
            <h1
              className="text-[#1D2539]"
              style={{
                ...t(type.headline),
                fontSize: "clamp(1.75rem, 5vw, 2rem)",
                lineHeight: 1.2,
                cursor: "default",
              }}
            >
              Vishal Birla
            </h1>
          </Appear>

          {/* description */}
          <Appear delay={0.14}>
            <div className="mt-4 space-y-4">
              <p className="w-full max-w-[576px]" style={{ ...t(type.aboutBody), fontWeight: 400 }}>
                I&apos;m a product designer based in India, currently designing at
                <span className="font-semibold text-[#1D2539]"> noon</span>.
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
