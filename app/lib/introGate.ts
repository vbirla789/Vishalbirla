import { useSyncExternalStore } from "react";

/* ----------------------------------------------------------------------------
 * Intro gate — holds the homepage's entrance animations until the visitor has
 * entered through the loader.
 *
 * The loader hides #page-shell while it plays, so every <Appear> on the page
 * would otherwise run its fade-and-rise behind it and be finished by the time
 * anyone could see it. With the gate shut they wait at their `initial` pose and
 * play the moment the loader hands over — the page builds itself in as the
 * loader leaves, the way the reference's scene builds after "hold to enter".
 *
 * Shut from the very first client render on the homepage: INTRO_INIT in
 * layout.tsx puts `intro-pending` on <html> before any script runs, so reading
 * it at module load is already correct during hydration. The server has no
 * document and reports open, which is harmless — `animate` is not part of the
 * server markup, only `initial` is, and that is the same either way.
 * --------------------------------------------------------------------------*/

let open =
  typeof document === "undefined" ||
  !document.documentElement.classList.contains("intro-pending");

const listeners = new Set<() => void>();

/** Lets everything waiting on the gate play. Idempotent. */
export function releaseIntro() {
  if (open) return;
  open = true;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const snapshot = () => open;

/** True once the visitor is in (always true off the homepage). */
export function useIntroOpen() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
