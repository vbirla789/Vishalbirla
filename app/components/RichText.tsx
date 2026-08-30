import { colors } from "../theme";

/* ----------------------------------------------------------------------------
 * Renders **double-asterisk** spans as emphasis in the primary tone.
 *
 * Deliberately has no "use client": it's a plain function component with no
 * hooks, so both the case-study page (a Server Component) and the Experience
 * timeline (a client component) can import the same one.
 * --------------------------------------------------------------------------*/
export default function RichText({ text }: { text: string }) {
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
