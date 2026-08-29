"use client";

/* ----------------------------------------------------------------------------
 * Tactile UI sounds, powered by cuelume.
 *
 * cuelume synthesizes each cue live via the Web Audio API — no audio files,
 * no dependencies. It owns the AudioContext (lazily created, auto-resumed
 * after the first gesture) and is a no-op during SSR, so this module stays a
 * thin mapping layer over it.
 *
 * TO RETUNE THE SOUND DESIGN, edit the CUES table below — nothing else.
 * The seventeen available cue names are:
 *   chime · sparkle · droplet · bloom · whisper · tick · press · release
 *   toggle · success · error · page · loading · ready · pulse · scan · arrival
 * --------------------------------------------------------------------------*/

import { play, setEnabled, setVolume, type SoundName } from "cuelume";

type Cue = { sound: SoundName; volume: number };

/** The whole sound design, in one table. Tweak names/volumes here. */
const CUES = {
  // Fires on every pointerenter across the nav, links and buttons — so this
  // wants the crispest, shortest cue in the palette.
  hover: { sound: "tick", volume: 0.32 },

  // A fuller knock for deliberate activation.
  select: { sound: "press", volume: 0.55 },

  // Fires repeatedly as the page crosses scroll detents (see useScrollTicks),
  // so it stays soft and airy — a crisp tick here would grate.
  scroll: { sound: "whisper", volume: 0.22 },

  // Confirmation after an action actually completes, e.g. copying the email.
  success: { sound: "success", volume: 0.5 },

  // A recoverable action failed — e.g. the clipboard rejected the write.
  error: { sound: "error", volume: 0.45 },
} as const satisfies Record<string, Cue>;

function cue({ sound, volume }: Cue) {
  play(sound, { volume });
}

/* ---- lifecycle -------------------------------------------------------------
 * cuelume creates and resumes its own AudioContext on first play(), so there
 * is nothing to build or unlock ahead of time. These two are kept as no-ops
 * because SideNav and CaseStudyNav call them on mount / first gesture.
 * --------------------------------------------------------------------------*/

/** No-op — retained for API compatibility with the previous Tone.js graph. */
export function preloadAudio() {}

/** No-op — cuelume resumes its own context on the first real cue. */
export function primeAudio() {}

/* ---- cues ---------------------------------------------------------------- */

/** Hover: a crisp, instant tick. */
export function playHover() {
  cue(CUES.hover);
}

/** Click: a fuller, muted knock. */
export function playSelect() {
  cue(CUES.select);
}

/** Scroll detent / section change: a soft hush with a falling tone. */
export function playScroll() {
  cue(CUES.scroll);
}

/** Action succeeded: a warm three-note confirmation. */
export function playSuccess() {
  cue(CUES.success);
}

/** Action failed recoverably: a soft knock and descending refusal. */
export function playError() {
  cue(CUES.error);
}

/* ---- preferences --------------------------------------------------------- */

/** Mute or unmute all future cues. cuelume does not persist this. */
export function setSoundEnabled(enabled: boolean) {
  setEnabled(enabled);
}

/** Global volume multiplier for all future cues, clamped 0–1 by cuelume. */
export function setSoundVolume(volume: number) {
  setVolume(volume);
}
