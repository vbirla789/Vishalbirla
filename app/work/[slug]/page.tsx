import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Appear from "../../components/Appear";
import BackButton from "../../components/BackButton";
import ToggleMedia from "../../components/ToggleMedia";
import CaseStudyNav from "../../components/CaseStudyNav";
import Footer from "../../components/Footer";
import { CaseMedia } from "../../components/caseMedia";
import { getProject, projects } from "../../lib/projects";
import type { StoryMedia, StorySection } from "../../lib/projects";
import { colors, t, type } from "../../theme";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Work — Vishal Birla" };
  return {
    title: `${project.company} — ${project.title}`,
    description: project.overview,
  };
}

/* ---------- building blocks (consistent with homepage typography) ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-mono uppercase" style={t(type.aboutLabel)}>
      {children}
    </p>
  );
}

// Case-study paragraph body — secondary tone, regular weight.
const BODY_COLOR = colors.secondary;

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[560px]" style={{ ...t(type.aboutBody), color: BODY_COLOR, fontWeight: 400 }}>
      {children}
    </p>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-center" style={{ ...t(type.expMeta), color: colors.tertiary }}>
      {children}
    </p>
  );
}

// Single headline style used for every heading on the case study (24px medium).
// Only two content type styles exist: this headline + the body/description.
const H2_STYLE = {
  ...t(type.caseH2),
  fontSize: 24,
  fontWeight: 500,
  lineHeight: 1.3,
  color: colors.primary,
} as React.CSSProperties;

const ITEM_BODY_STYLE = {
  ...t(type.aboutBody),
  color: BODY_COLOR,
  fontWeight: 400,
} as React.CSSProperties;

/** Renders text with **double-asterisk** spans as bold, emphasized in the primary tone. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} style={{ fontWeight: 600, color: colors.primary }}>
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** One media slot (image / images / video / placeholder) plus an optional caption. */
function MediaBlock({ media, alt }: { media: StoryMedia; alt: string }) {
  return (
    <div className="mt-8">
      <CaseMedia
        image={media.image}
        images={media.images}
        video={media.video}
        media={media.media}
        placeholder={media.placeholder}
        alt={alt}
      />
      {media.caption ? <Caption>{media.caption}</Caption> : null}
    </div>
  );
}

function DataTable({ table }: { table: { columns: string[]; rows: string[][] } }) {
  return (
    <div className="mt-6 w-full overflow-x-auto rounded-xl ring-1 ring-black/5">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-black/5">
            {table.columns.map((c) => (
              <th
                key={c}
                className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide"
                style={{ color: colors.tertiary }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3 text-[14px]"
                  style={{ fontWeight: 500, color: colors.primary }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A free-form story section for richer case studies (Context, Getting started, …). */
function StoryBlock({ section, company }: { section: StorySection; company: string }) {
  return (
    <>
      <div className="my-16 h-px w-full" style={{ background: colors.line }} />
      <section id={section.id} className="scroll-mt-28">
        <Appear inView>
          <Eyebrow>{section.eyebrow}</Eyebrow>
          {section.heading ? (
            <h2 className="max-w-[600px]" style={H2_STYLE}>
              {section.heading}
            </h2>
          ) : null}
          {section.body ? (
            <div className="mt-5">
              <Body>{section.body}</Body>
            </div>
          ) : null}
          {section.bullets && section.bullets.length > 0 ? (
            <ul className="mt-5 flex max-w-[560px] flex-col gap-3">
              {section.bullets.map((b, bi) => (
                <li key={bi} className="flex gap-3">
                  <span
                    className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: colors.tertiary }}
                  />
                  <p style={ITEM_BODY_STYLE}>
                    <RichText text={b} />
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {section.closing ? (
            <p className="mt-5 max-w-[560px]" style={ITEM_BODY_STYLE}>
              <RichText text={section.closing} />
            </p>
          ) : null}
          {section.media ? (
            <MediaBlock media={section.media} alt={`${company} ${section.navLabel}`} />
          ) : null}

          {section.briefs && section.briefs.length > 0 ? (
            <div className="mt-2 flex flex-col gap-7">
              {section.briefs.map((b) => (
                <div key={b.label}>
                  <p className="mb-2" style={H2_STYLE}>
                    {b.label}
                  </p>
                  <p className="max-w-[560px]" style={ITEM_BODY_STYLE}>
                    <RichText text={b.body} />
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {section.items && section.items.length > 0 ? (
            <div className={`flex flex-col gap-16 ${section.heading ? "mt-14" : "mt-6"}`}>
              {section.items.map((it, idx) => (
                <div key={it.title ?? idx}>
                  {it.title ? (
                    <h2 className="max-w-[600px]" style={H2_STYLE}>
                      {it.title}
                    </h2>
                  ) : null}
                  {it.body ? (
                    <div className="mt-2 flex max-w-[560px] flex-col gap-4">
                      {it.body.split("\n\n").map((para, pi) => (
                        <p key={pi} style={ITEM_BODY_STYLE}>
                          <RichText text={para} />
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {it.bullets && it.bullets.length > 0 ? (
                    <ul className="mt-4 flex max-w-[560px] flex-col gap-3">
                      {it.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-3">
                          <span
                            className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: colors.tertiary }}
                          />
                          <p style={ITEM_BODY_STYLE}>
                            <RichText text={b} />
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {it.versions && it.versions.length > 0 ? (
                    <div className="mt-8 rounded-2xl bg-zinc-50 p-6 ring-1 ring-black/5">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                        {it.versions.map((v) => (
                          <figure key={v.label} className="flex flex-col gap-3">
                            <figcaption
                              className="text-center text-[13px] font-medium"
                              style={{ color: colors.primary }}
                            >
                              {v.label}
                            </figcaption>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={v.image}
                              alt={v.label}
                              className="mx-auto w-full max-w-[150px] rounded-xl ring-1 ring-black/5"
                              loading="lazy"
                            />
                          </figure>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {it.table ? <DataTable table={it.table} /> : null}
                  {it.toggle ? (
                    <div className="mt-8">
                      <ToggleMedia options={it.toggle} alt={it.title ?? company} />
                    </div>
                  ) : null}
                  {it.media ? (
                    <MediaBlock media={it.media} alt={it.title ?? company} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {section.videos && section.videos.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {section.videos.map((v, i) => {
                const label = String.fromCharCode(65 + i);
                const chosen = section.chosenVideo === i;
                return (
                  <div
                    key={v}
                    className="flex flex-col items-center gap-8 rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5"
                  >
                    <div className="overflow-hidden rounded-[22px]">
                      <video
                        className="block h-[320px] w-auto object-contain"
                        src={v}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: chosen ? "#000000" : colors.tertiary }}
                    >
                      {chosen ? `Approach ${label} · chosen` : `Approach ${label}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Appear>
      </section>
    </>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Side-nav items: driven by the story sections when present, else the fixed set.
  const navItems = project.story
    ? [
        { id: "overview", label: "Overview" },
        ...project.story.map((s) => ({ id: s.id, label: s.navLabel })),
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "problem", label: "Problem" },
        { id: "outcomes", label: "Outcomes" },
        { id: "solution", label: "Solution" },
        { id: "experiments", label: "AI Experiments" },
        { id: "process", label: "Process" },
      ];

  return (
    <>
      <CaseStudyNav items={navItems} />

      <main className="mx-auto w-full max-w-[720px] px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
        {/* ---------------- Overview / header ---------------- */}
        <section id="overview" className="relative scroll-mt-28">
          {/* back button — fixed in the left gutter so it stays visible on scroll */}
          <div className="fixed left-[calc(50%-400px)] top-28 z-40 hidden lg:block">
            <BackButton />
          </div>
          {/* narrow screens (no gutter): back button above the title */}
          <div className="mb-6 lg:hidden">
            <BackButton />
          </div>
          {/* title appears first */}
          <Appear>
            <div className="mb-3 flex items-center gap-2" style={t(type.projectMeta)}>
              <span style={{ fontSize: 15 }}>{project.company}</span>
              <span>·</span>
              <span>{project.year}</span>
            </div>
            <h1
              className="w-full"
              style={{ ...t(type.headline), fontSize: "clamp(1.375rem, 5.5vw, 1.75rem)", lineHeight: 1.25 }}
            >
              {project.title}
            </h1>
          </Appear>

          <Appear delay={0.14}>
            <div className="mt-6">
              <Body>{project.overview}</Body>
            </div>
          </Appear>

          {project.hero ? (
            <Appear delay={0.24}>
              <div className="mt-10">
                {project.hero.toggle ? (
                  <ToggleMedia
                    options={project.hero.toggle}
                    alt={`${project.company} overview`}
                  />
                ) : (
                  <CaseMedia
                    image={project.hero.image}
                    media={project.hero.media}
                    video={project.hero.video}
                    alt={`${project.company} overview`}
                  />
                )}
              </div>
            </Appear>
          ) : null}

          <Appear delay={0.32}>
            <div className="mt-10 flex h-fit flex-wrap gap-x-16 gap-y-6">
              <div className="flex shrink-0 flex-col self-start">
                <Eyebrow>Role</Eyebrow>
                <p style={t(type.expOrg)}>{project.role}</p>
              </div>
              {project.collaborators.length > 0 ? (
                <div>
                  <Eyebrow>Collaborators</Eyebrow>
                  <div className="flex flex-col gap-2">
                    {project.collaborators.map((c) => (
                      <span key={c} style={{ ...t(type.expCompany), fontSize: 15, color: "#1D2539" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Appear>
        </section>

        {/* ---------------- Story sections (rich case studies, e.g. noon) ---------------- */}
        {project.story?.map((s) => (
          <StoryBlock key={s.id} section={s} company={project.company} />
        ))}

        {/* ---------------- Problem ---------------- */}
        {project.problem ? (
          <>
            <div className="my-16 h-px w-full" style={{ background: colors.line }} />
            <section id="problem" className="scroll-mt-28">
              <Appear inView>
              <Eyebrow>Problem</Eyebrow>
              <h2 className="max-w-[600px]" style={H2_STYLE}>
                {project.problem.heading}
              </h2>
              <div className="mt-5">
                <Body>{project.problem.body}</Body>
              </div>

              <ol className="mt-10 flex flex-col gap-8">
                {project.problem.points.map((pt, i) => (
                  <li key={pt.title} className="flex gap-4">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                      style={{ background: "#f4f4f5", color: colors.primary }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 style={{ ...H2_STYLE, fontSize: 20 }}>{pt.title}</h3>
                      <p className="mt-1.5 max-w-[520px]" style={ITEM_BODY_STYLE}>
                        {pt.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {project.problem.media || project.problem.image || project.problem.images ? (
                <div className="mt-10">
                  <CaseMedia
                    image={project.problem.image}
                    images={project.problem.images}
                    media={project.problem.media}
                    alt={`${project.company} problem`}
                  />
                </div>
              ) : null}
              </Appear>
            </section>
          </>
        ) : null}

        {project.outcomes ? (
          <>
            <div className="my-16 h-px w-full" style={{ background: colors.line }} />

            {/* ---------------- Outcomes ---------------- */}
            <section id="outcomes" className="scroll-mt-28">
              <Appear inView>
              <Eyebrow>Outcomes</Eyebrow>
              <h2
            className="max-w-[600px]"
            style={H2_STYLE}
          >
                {project.outcomes.heading}
              </h2>
              <div className="mt-5">
                <Body>{project.outcomes.body}</Body>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {project.outcomes.metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl bg-zinc-50 p-6">
                    <div style={{ ...t(type.caseMetric), fontSize: "clamp(1.5rem, 6vw, 2rem)" }}>{m.value}</div>
                    <p className="mt-2" style={{ ...t(type.expMeta), color: "#666D85" }}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
              </Appear>
            </section>
          </>
        ) : null}

        {/* ---------------- Solution ---------------- */}
        {project.solution ? (
          <>
        <div className="my-16 h-px w-full" style={{ background: colors.line }} />

        <section id="solution" className="scroll-mt-28">
          <Appear inView>
          <Eyebrow>Solution</Eyebrow>
          <h2
            className="max-w-[600px]"
            style={H2_STYLE}
          >
            {project.solution.heading}
          </h2>
          <div className="mt-5">
            <Body>{project.solution.body}</Body>
          </div>

          <div className="mt-14 flex flex-col gap-20">
            {project.solution.sections.map((s) => (
              <div key={s.title}>
                <h3 style={H2_STYLE}>{s.title}</h3>
                <p className="mt-2 max-w-[560px]" style={{ ...t(type.aboutBody), color: BODY_COLOR, fontWeight: 400 }}>
                  {s.body}
                </p>
                {s.table ? (
                  <div className="mt-6 w-full overflow-x-auto rounded-xl ring-1 ring-black/5">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          {s.table.columns.map((c) => (
                            <th
                              key={c}
                              className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide"
                              style={{ color: colors.tertiary }}
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {s.table.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-4 py-3 text-[14px]"
                                style={{ color: ci === 0 ? colors.primary : BODY_COLOR }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {s.media || s.image || s.images ? (
                  <div className="mt-8">
                    <CaseMedia
                      image={s.image}
                      images={s.images}
                      media={s.media}
                      alt={s.title}
                    />
                    {s.caption ? <Caption>{s.caption}</Caption> : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          </Appear>
        </section>
          </>
        ) : null}

        {/* ---------------- AI Experiments ---------------- */}
        {project.experiments ? (
          <>
            <div className="my-16 h-px w-full" style={{ background: colors.line }} />
            <section id="experiments" className="scroll-mt-28">
              <Appear inView>
              <Eyebrow>AI Experiments</Eyebrow>
              <h2
                className="max-w-[600px]"
                style={H2_STYLE}
              >
                {project.experiments.heading}
              </h2>
              <div className="mt-5">
                <Body>{project.experiments.body}</Body>
              </div>
              {project.experiments.videos && project.experiments.videos.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {project.experiments.videos.map((v) => (
                    <div
                      key={v}
                      className="flex justify-center rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5"
                    >
                      <div className="overflow-hidden rounded-[22px]">
                        <video
                          className="block h-[320px] w-auto object-contain"
                          src={v}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="mt-8 flex h-[320px] items-center justify-center rounded-2xl bg-zinc-100 text-center"
                  style={{ ...t(type.expMeta), color: colors.tertiary }}
                >
                  AI-prototype videos to be added here
                </div>
              )}
              </Appear>
            </section>
          </>
        ) : null}

        {/* ---------------- Process ---------------- */}
        {project.process ? (
          <>
            <div className="my-16 h-px w-full" style={{ background: colors.line }} />
            <section id="process" className="scroll-mt-28">
              <Appear inView>
              <Eyebrow>Process</Eyebrow>
              <h2 className="max-w-[600px]" style={H2_STYLE}>
                {project.process.heading}
              </h2>
              <div className="mt-5">
                <Body>{project.process.body}</Body>
              </div>

              {project.process.media || project.process.images ? (
                <div className="mt-10">
                  <CaseMedia
                    images={project.process.images}
                    media={project.process.media}
                    alt={`${project.company} process`}
                  />
                </div>
              ) : null}
              </Appear>
            </section>
          </>
        ) : null}

        <Appear inView>
          <Footer />
        </Appear>
      </main>
    </>
  );
}
