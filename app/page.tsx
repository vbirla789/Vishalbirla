import SideNav from "./components/SideNav";
import TimelineWidget from "./components/TimelineWidget";
import WorkSection from "./components/WorkSection";
import Footer from "./components/Footer";
import { t, type } from "./theme";

export default function Home() {
  return (
    <>
      <SideNav />
      <main className="mx-auto w-full max-w-[800px] px-6 pb-32 pt-32">
        {/* dynamic timeline widget */}
        <div id="intro" className="scroll-mt-28">
          <TimelineWidget />
        </div>

        {/* hero */}
        <h1 className="mt-16 max-w-[820px]" style={t(type.headline)}>
          Vishal Birla is a Product Designer &amp; Framer Expert.
        </h1>

        {/* about */}
        <section id="about" className="mt-14 max-w-[640px] scroll-mt-28">
          <p className="mb-3 font-mono uppercase" style={t(type.aboutLabel)}>
            About
          </p>
          <p style={t(type.aboutBody)}>
            Vishal is a Product Designer at Ambitio, where he builds edtech and AI
            products used by thousands of learners. An engineer-turned-designer, he
            designs in Figma and prototypes in Framer.
          </p>
          <p className="mt-5" style={t(type.aboutBody)}>
            He loves building with AI and playing with code to bring ideas to life,
            and believes the best design is the kind you don&apos;t notice — you just
            get your thing done and move on.
          </p>

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
