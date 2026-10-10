// Up to 3 generations per session: the first preview plus 2 tries (docs/SPEC.md §4).
export const MAX_GENERATIONS = 3;

/** Tries left after `generationsDone` successful previews (the first preview is not a try). */
export function triesLeft(generationsDone: number): number {
  return Math.max(0, MAX_GENERATIONS - Math.max(1, generationsDone));
}

export function triesLeftLabel(n: number): string {
  if (n === 0) return "No tries left";
  return `${n} ${n === 1 ? "try" : "tries"} left`;
}
