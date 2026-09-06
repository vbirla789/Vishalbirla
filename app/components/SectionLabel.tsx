import { t, type } from "../theme";

/**
 * The small mono-uppercase label above every page section — ABOUT, WORK,
 * EXPERIENCE, CONCEPTS, CRAFTED EXPERIENCES AT.
 *
 * Lives here rather than inside WorkSection because page.tsx needs it too.
 * It previously did: WorkSection owned the primitive at mb-5 while page.tsx
 * hand-rolled the same markup at mb-4, so the five labels on one page rendered
 * at two different bottom margins. One owner means that cannot drift again.
 *
 * No "use client" on purpose — it holds no state, so it composes into the
 * server-rendered page and the client sections alike.
 */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 font-mono uppercase" style={t(type.aboutLabel)}>
      {children}
    </p>
  );
}
