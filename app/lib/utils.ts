/**
 * Minimal class joiner.
 *
 * Deliberately not clsx + tailwind-merge: the only consumer is the fancy
 * typewriter, which passes plain strings and never needs Tailwind conflict
 * resolution. Two dependencies for that would be overkill.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
