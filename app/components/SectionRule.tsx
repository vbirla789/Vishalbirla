/**
 * Structural rule above a homepage section: a full-bleed hairline with small
 * accent squares where it crosses the content column's edges — the
 * blueprint-ish look from the Arbor.ai reference.
 *
 * Purely decorative (aria-hidden) and deliberately homepage-only: the case
 * study pages have their own quieter rhythm, so don't reach for this there.
 *
 * The line breaks out of the 840px column with left-1/2 + w-screen. w-screen
 * is 100vw, which on systems with classic (non-overlay) scrollbars is a touch
 * wider than the viewport — html { overflow-x: clip } in globals.css exists to
 * swallow that excess, so don't remove it without checking this component.
 *
 * No "use client": pure markup, so the server-rendered homepage can use it.
 */
export default function SectionRule() {
  return (
    /* Height, not margin: every visible child is absolute, so the box is
       otherwise zero-height and a bottom margin self-collapses — which shoved
       the line down onto the section label wherever the rule had no prior
       sibling. Real height can't collapse; the line and squares draw along its
       top.

       This is the space between the line and the section label, and it must
       equal the section spacing below (WorkSection's space-y) at BOTH
       breakpoints or the band around each rule reads lopsided. Change them
       together: 56px on phones, 84px from sm up. */
    <div aria-hidden className="relative h-14 sm:h-[84px]">
      {/* hidden sm:block — no structure grid on phones, where the lines read as
          clutter rather than structure. The box keeps its height either way, so
          the rhythm survives; only the marks go. */}
      <div className="absolute left-1/2 top-0 hidden h-px w-screen -translate-x-1/2 bg-[color:var(--c-line)] sm:block" />
      {/* Squares centred on the line. From min-[888px] they shift out to the
          column's BOX edges (-left-6 = the px-6 gutter) so they sit exactly on
          the vertical structure lines in page.tsx and mark the intersections;
          between sm and that, the verticals are hidden and the squares mark the
          content edges instead. Keep the breakpoints in sync. */}
      <div className="absolute left-0 top-0 hidden h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 bg-[color:var(--c-accent)] sm:block min-[888px]:-left-6" />
      <div className="absolute right-0 top-0 hidden h-[5px] w-[5px] -translate-y-1/2 translate-x-1/2 bg-[color:var(--c-accent)] sm:block min-[888px]:-right-6" />
    </div>
  );
}
