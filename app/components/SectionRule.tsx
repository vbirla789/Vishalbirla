/**
 * Structural rule above a homepage section: a full-bleed hairline with small
 * accent squares where it crosses the content column's edges — the
 * blueprint-ish look from the Arbor.ai reference.
 *
 * Purely decorative (aria-hidden) and deliberately homepage-only: the case
 * study pages have their own quieter rhythm, so don't reach for this there.
 *
 * The line breaks out of the 800px column with left-1/2 + w-screen. w-screen
 * is 100vw, which on systems with classic (non-overlay) scrollbars is a touch
 * wider than the viewport — html { overflow-x: clip } in globals.css exists to
 * swallow that excess, so don't remove it without checking this component.
 *
 * No "use client": pure markup, so the server-rendered homepage can use it.
 */
export default function SectionRule() {
  return (
    <div aria-hidden className="relative mb-9">
      <div className="absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-[color:var(--c-line)]" />
      {/* squares centred on the line, at the column's left and right edges */}
      <div className="absolute left-0 top-0 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 bg-[color:var(--c-accent)]" />
      <div className="absolute right-0 top-0 h-[5px] w-[5px] -translate-y-1/2 translate-x-1/2 bg-[color:var(--c-accent)]" />
    </div>
  );
}
