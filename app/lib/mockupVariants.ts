/**
 * Mockups that ship in two versions: the grey-backed sheet for the light theme
 * and a black-backed one for dark. The pair is the same artwork — only the
 * canvas behind it differs — and the dark file is always the light path with
 * `-dark` before the extension.
 *
 * Kept as an explicit list rather than guessed at render time. The background
 * is baked into these PNGs, so a path that has no dark twin (the iter-* frames,
 * which are transparent and read correctly on either theme) must be left alone
 * — pointing at a file that doesn't exist would just render a broken image.
 */
const WITH_DARK_VARIANT = new Set([
  "/work/ambitio/application-detail.png",
  "/work/ambitio/components.png",
  "/work/ambitio/course-detail.png",
  "/work/ambitio/course-finder.png",
  "/work/ambitio/document-manager.png",
  "/work/ambitio/manage-applications.png",
  "/work/ambitio/scholarship-finder.png",
  "/work/fibr/aya.png",
  "/work/fibr/cro-agency.png",
  "/work/fibr/faq.png",
  "/work/fibr/liv.png",
  "/work/fibr/max.png",
  "/work/noon/competitive.png",
  "/work/noon/preview.png",
  "/work/noon/rating-states.png",
  "/work/noon/system.png",
]);

/** The dark twin of a mockup, or null when it only ships one version. */
export function darkVariant(src: string): string | null {
  if (!WITH_DARK_VARIANT.has(src)) return null;
  return src.replace(/\.png$/, "-dark.png");
}
