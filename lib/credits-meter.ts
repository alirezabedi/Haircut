// Credit meter rules (docs/SPEC.md §2.6): full at 100 or more, scales below, destructive at ≤ 10.
export const METER_FULL_AT = 100;
export const LOW_CREDITS = 10;

/** Meter fill as a percentage, 0–100. */
export function meterFill(remaining: number): number {
  return Math.min(100, Math.max(0, (remaining / METER_FULL_AT) * 100));
}

export function isLow(remaining: number): boolean {
  return remaining <= LOW_CREDITS;
}

/** "1 credit left", "73 credits left". */
export function creditsLeftLabel(remaining: number): string {
  return `${remaining} ${remaining === 1 ? "credit" : "credits"} left`;
}
