/* ============================================================================
 * 🎨 DESIGN TOKENS — THE ONE FILE TO TUNE
 * ----------------------------------------------------------------------------
 * Edit the numbers / hex values below, save, and the whole site updates.
 * Then paste this file back in chat and I'll apply it.
 *
 *  • size       = font size in px
 *  • weight     = 400 normal · 500 medium · 600 semibold · 700 bold
 *  • lineHeight = line height in px
 *  • tracking   = letter-spacing in em (e.g. -0.03 = tighter, 0 = normal)
 *  • color      = any CSS color (hex like "#1D2539", or oklch(...))
 * ==========================================================================*/

/* ---- COLORS ---------------------------------------------------------------*/
/* Every value is a CSS variable, defined for light in `:root` and overridden
 * under `.dark` in globals.css. Because these are var() references rather than
 * literals, the ~100 inline `style={{ color: colors.x }}` usages across the app
 * follow the theme automatically — no per-component dark variants needed.
 *
 * TO RETUNE EITHER THEME, edit the two blocks in app/globals.css. */
export const colors = {
  background: "var(--c-background)",

  /* TEXT — the three brand text colors */
  primary: "var(--c-primary)", // headings + prominent text
  secondary: "var(--c-secondary)", // body + supporting text
  tertiary: "var(--c-tertiary)", // labels/captions: ABOUT, axis times, location, GMT

  /* UI */
  line: "var(--c-line)", // hairline borders
  panel: "var(--c-panel)", // card panel + polaroid background
  accent: "var(--c-accent)", // timeline pin / marker / Ask AI sparkle
  surface: "var(--c-surface)", // raised surface: active nav pill, composer

  /* TABS */
  tabActive: "var(--c-tab-active)", // active tab text (= primary)
  tabActiveBg: "var(--c-tab-active-bg)", // tab track background
  tabInactive: "var(--c-tab-inactive)", // inactive tab text
  tabInactiveHover: "var(--c-tab-inactive-hover)", // inactive tab text on hover

  /* BUTTONS — Contact (solid) and View Resume (muted).
     The *Ring tokens are transparent in light and a hairline in dark, where
     fills alone don't separate the two actions. */
  btnSolidBg: "var(--c-btn-solid-bg)",
  btnSolidText: "var(--c-btn-solid-text)",
  btnSolidRing: "var(--c-btn-solid-ring)",
  btnMutedBg: "var(--c-btn-muted-bg)",
  btnMutedBgHover: "var(--c-btn-muted-bg-hover)",
  btnMutedRing: "var(--c-btn-muted-ring)",
};

/* ---- TYPOGRAPHY -----------------------------------------------------------*/
export type TypeToken = {
  size: number;
  weight: number;
  lineHeight: number;
  tracking: number;
  color: string;
};

export const type: Record<string, TypeToken> = {
  // Hero headline — "Vishal Birla is a Product Designer & Framer Expert."
  headline: { size: 32, weight: 500, lineHeight: 40, tracking: -0.03, color: colors.primary },

  // "ABOUT" label
  aboutLabel: { size: 12, weight: 500, lineHeight: 18, tracking: 0, color: colors.tertiary },

  // About paragraphs
  aboutBody: { size: 16, weight: 500, lineHeight: 24, tracking: 0, color: colors.secondary },

  // Timeline widget — "Bengaluru" / "GMT+05:30"
  location: { size: 12, weight: 500, lineHeight: 18, tracking: 0, color: colors.tertiary },

  // Timeline widget — "9:00 AM / 6:30 PM / 2:00 AM"
  axis: { size: 10, weight: 500, lineHeight: 15, tracking: 0, color: colors.tertiary },

  // Tabs — Work / Fun / About / Resume (color applied per active/inactive state)
  tab: { size: 14, weight: 500, lineHeight: 20, tracking: 0, color: colors.tabInactive },

  // Project card — "Ambitio · 2025"
  projectMeta: { size: 13, weight: 500, lineHeight: 18, tracking: 0, color: colors.secondary },

  // Project card — title line
  projectTitle: { size: 15, weight: 500, lineHeight: 22, tracking: 0, color: colors.primary },

  // Project card — subtitle line
  projectSub: { size: 13, weight: 400, lineHeight: 20, tracking: 0, color: colors.secondary },

  // Experience rows (About tab)
  expOrg: { size: 15, weight: 500, lineHeight: 22, tracking: 0, color: colors.primary },
  expMeta: { size: 13, weight: 400, lineHeight: 20, tracking: 0, color: colors.secondary },
  expCompany: { size: 14, weight: 500, lineHeight: 20, tracking: 0, color: colors.secondary },

  // Case study — section title (H2)
  caseH2: { size: 26, weight: 500, lineHeight: 32, tracking: -0.02, color: colors.primary },
  // Case study — sub-heading (H3)
  caseH3: { size: 17, weight: 500, lineHeight: 24, tracking: -0.01, color: colors.primary },
  // Case study — big outcome metric number
  caseMetric: { size: 32, weight: 500, lineHeight: 36, tracking: -0.02, color: colors.primary },
};

/* ---- helper: turn a token into a React inline-style object -----------------*/
export function t(token: TypeToken): React.CSSProperties {
  return {
    fontSize: `${token.size}px`,
    fontWeight: token.weight,
    lineHeight: `${token.lineHeight}px`,
    letterSpacing: `${token.tracking}em`,
    color: token.color,
  };
}
