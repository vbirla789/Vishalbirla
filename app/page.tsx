import SideNav from "./components/SideNav";
import TimelineWidget from "./components/TimelineWidget";
import WorkSection from "./components/WorkSection";
import Footer from "./components/Footer";
import { t, type } from "./theme";

export default function Home() {
  return (
    <>
      <SideNav />
      <main className="mx-auto w-full max-w-[800px] px-6 pb-24 pt-20 sm:pb-32 sm:pt-32">
        {/* dynamic timeline widget */}
        <div id="intro" className="scroll-mt-28">
          <TimelineWidget />
        </div>

        {/* about / intro */}
        <section id="about" className="mt-12 max-w-[640px] scroll-mt-28 sm:mt-16">
          <p className="mb-4 font-mono uppercase" style={t(type.aboutLabel)}>
            About
          </p>

          {/* name (title) */}
          <h1
            style={{
              ...t(type.headline),
              fontSize: "clamp(1.5rem, 5vw, 1.75rem)",
              lineHeight: 1.2,
            }}
          >
            Vishal Birla
          </h1>

          {/* description */}
          <div className="mt-4 space-y-4">
            <p style={t(type.aboutBody)}>
              I&apos;m a product designer based out of India, currently working
              at <span className="font-semibold">noon</span>.
            </p>
            <p style={t(type.aboutBody)}>
              I love shaping how things look, then bringing them to life with the
              help of <span className="font-semibold">AI</span> — always
              experimenting to turn the designs I create into living, interactive
              experiences.
            </p>
          </div>

          {/* crafted experiences at — client / company logos */}
          <div className="mt-9">
            <p
              className="mb-4 font-mono uppercase"
              style={t(type.aboutLabel)}
            >
              Crafted experiences at
            </p>
            {/* per-logo heights tuned so the marks read at the same optical size
                (each source image has different internal padding) */}
            <div className="flex flex-wrap items-center gap-4">
              {/* eslint-disable @next/next/no-img-element */}
              <img src="/crafted/noon.svg" alt="noon" className="h-[14px] w-auto" />
              <img src="/crafted/ambitio.png" alt="Ambitio" className="h-[18px] w-auto" />
              <img
                src="/crafted/fibr.png"
                alt="Fibr.ai"
                loading="eager"
                className="h-[20px] w-auto"
              />
              <img src="/crafted/dzinr.png" alt="DZINR" className="h-[24px] w-auto" />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          </div>
        </section>

        {/* work / experience / fun / resume */}
        <div className="mt-20">
          <WorkSection />
        </div>

        {/* footer */}
        <Footer />
      </main>
    </>
  );
}
