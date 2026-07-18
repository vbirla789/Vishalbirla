import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BackButton from "../../components/BackButton";
import CaseStudyNav from "../../components/CaseStudyNav";
import Footer from "../../components/Footer";
import { CaseMedia } from "../../components/caseMedia";
import { getProject, projects } from "../../lib/projects";
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

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <CaseStudyNav />

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
          <div className="mb-3 flex items-center gap-2" style={t(type.projectMeta)}>
            <span>{project.company}</span>
            <span>·</span>
            <span>{project.year}</span>
          </div>
          <h1
            className="w-full"
            style={{ ...t(type.headline), fontSize: "clamp(1.375rem, 5.5vw, 1.75rem)", lineHeight: 1.25 }}
          >
            {project.title}
          </h1>
          <div className="mt-6">
            <Body>{project.overview}</Body>
          </div>

          {project.hero ? (
            <div className="mt-10">
              <CaseMedia
                image={project.hero.image}
                media={project.hero.media}
                video={project.hero.video}
                alt={`${project.company} overview`}
              />
            </div>
          ) : null}

          <div className="mt-10 flex h-fit flex-wrap gap-x-16 gap-y-6">
            <div className="flex shrink-0 flex-col self-start">
              <Eyebrow>Role</Eyebrow>
              <p style={t(type.expOrg)}>{project.role}</p>
            </div>
            {project.collaborators.length > 0 ? (
              <div>
                <Eyebrow>Collaborators</Eyebrow>
                <div className="flex flex-col gap-1">
                  {project.collaborators.map((c) => (
                    <span key={c} style={t(type.expCompany)}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="my-16 h-px w-full" style={{ background: colors.line }} />

        {/* ---------------- Problem ---------------- */}
        <section id="problem" className="scroll-mt-28">
          <Eyebrow>Problem</Eyebrow>
          <h2
            className="max-w-[600px]"
            style={{ ...t(type.caseH2), fontSize: "clamp(1.25rem, 5vw, 1.625rem)", lineHeight: 1.25 }}
          >
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
                  <h3 style={t(type.caseH3)}>{pt.title}</h3>
                  <p className="mt-1.5 max-w-[520px]" style={{ ...t(type.aboutBody), color: BODY_COLOR, fontWeight: 400 }}>
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
        </section>

        {project.outcomes ? (
          <>
            <div className="my-16 h-px w-full" style={{ background: colors.line }} />

            {/* ---------------- Outcomes ---------------- */}
            <section id="outcomes" className="scroll-mt-28">
              <Eyebrow>Outcomes</Eyebrow>
              <h2
            className="max-w-[600px]"
            style={{ ...t(type.caseH2), fontSize: "clamp(1.25rem, 5vw, 1.625rem)", lineHeight: 1.25 }}
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
            </section>
          </>
        ) : null}

        <div className="my-16 h-px w-full" style={{ background: colors.line }} />

        {/* ---------------- Solution ---------------- */}
        <section id="solution" className="scroll-mt-28">
          <Eyebrow>Solution</Eyebrow>
          <h2
            className="max-w-[600px]"
            style={{ ...t(type.caseH2), fontSize: "clamp(1.25rem, 5vw, 1.625rem)", lineHeight: 1.25 }}
          >
            {project.solution.heading}
          </h2>
          <div className="mt-5">
            <Body>{project.solution.body}</Body>
          </div>

          <div className="mt-14 flex flex-col gap-20">
            {project.solution.sections.map((s) => (
              <div key={s.title}>
                <h3 style={t(type.caseH3)}>{s.title}</h3>
                <p className="mt-2 max-w-[560px]" style={{ ...t(type.aboutBody), color: BODY_COLOR, fontWeight: 400 }}>
                  {s.body}
                </p>
                {s.table ? (
                  <div className="mt-6 max-w-[560px] overflow-x-auto rounded-xl ring-1 ring-black/5">
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
        </section>

        <div className="my-16 h-px w-full" style={{ background: colors.line }} />

        {/* ---------------- Process ---------------- */}
        <section id="process" className="scroll-mt-28">
          <Eyebrow>Process</Eyebrow>
          <h2
            className="max-w-[600px]"
            style={{ ...t(type.caseH2), fontSize: "clamp(1.25rem, 5vw, 1.625rem)", lineHeight: 1.25 }}
          >
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
        </section>

        <Footer />
      </main>
    </>
  );
}
