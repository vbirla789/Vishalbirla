"use client";

/* ----------------------------------------------------------------------------
 * Tactile UI sounds via Tone.js.
 * Every voice runs through a master limiter and uses a real attack/decay
 * envelope, so there's no pop on the first click and levels stay consistent.
 * Tone is imported dynamically (client-only) to stay clear of SSR, and the
 * audio graph is built up-front (preloadAudio) while the AudioContext is only
 * resumed on the first user gesture (primeAudio).
 * --------------------------------------------------------------------------*/

type ToneMod = typeof import("tone");

let Tone: ToneMod | null = null;
let built = false;
let resumed = false;

let voices: {
  hover: import("tone").MembraneSynth;
  select: import("tone").MembraneSynth;
  scroll: import("tone").MembraneSynth;
} | null = null;

/** Build the audio graph. Safe before any gesture — the context stays suspended. */
async function load() {
  if (built || typeof window === "undefined") return;
  if (!Tone) Tone = await import("tone");

  // Master limiter keeps every hit at a consistent, controlled level.
  const limiter = new Tone.Limiter(-6).toDestination();

  // High-pass for the section pock — strips the low-end boom, leaves a tight tick.
  const scrollHP = new Tone.Filter({
    type: "highpass",
    frequency: 500,
    rolloff: -24,
  }).connect(limiter);

  voices = {
    // light, high, quick tick
    hover: new Tone.MembraneSynth({
      volume: -19,
      octaves: 2,
      pitchDecay: 0.006,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    }).connect(limiter),
    // fuller, lower knock
    select: new Tone.MembraneSynth({
      volume: -11,
      octaves: 4,
      pitchDecay: 0.03,
      envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.06 },
    }).connect(limiter),
    // satisfying tight "tock" as each section is entered — high-passed, no boom
    scroll: new Tone.MembraneSynth({
      volume: -10,
      octaves: 1,
      pitchDecay: 0.01,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 },
    }).connect(scrollHP),
  };

  built = true;
}

/** Build the audio graph early (call on mount). No sound, no gesture needed. */
export function preloadAudio() {
  void load();
}

/** Resume the audio context — call on the first user gesture. */
export function primeAudio() {
  void load().then(async () => {
    if (!Tone) return;
    await Tone.start();
    resumed = true;
  });
}

function play(kind: "hover" | "select" | "scroll", note: string, dur: number) {
  if (!built || !resumed || !voices) {
    primeAudio(); // warm up; the next interaction will sound
    return;
  }
  try {
    voices[kind].triggerAttackRelease(note, dur);
  } catch {
    /* ignore rapid-retrigger scheduling collisions (e.g. fast scroll) */
  }
}

/** Hover: a light, high, quick woody tick. */
export function playHover() {
  play("hover", "C5", 0.03);
}

/** Click: a fuller, lower, satisfying woody knock. */
export function playSelect() {
  play("select", "C3", 0.14);
}

/** Section change: a tight, satisfying tock as each section scrolls into view. */
export function playScroll() {
  play("scroll", "C4", 0.08);
}
