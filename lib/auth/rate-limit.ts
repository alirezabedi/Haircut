// In-memory sliding-window limiter for PIN attempts: 5 per 15 minutes per IP (docs/SPEC.md §3).
// One Node process serves the shop, so memory is enough for v1.
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit = 5,
    private readonly windowMs = 15 * 60 * 1000,
  ) {}

  /** True if this key may make another attempt now. Does not record an attempt. */
  allowed(key: string, now = Date.now()): boolean {
    return this.recent(key, now).length < this.limit;
  }

  /** Records a failed attempt. */
  hit(key: string, now = Date.now()): void {
    this.hits.set(key, [...this.recent(key, now), now]);
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  private recent(key: string, now: number): number[] {
    const kept = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (kept.length) this.hits.set(key, kept);
    else this.hits.delete(key);
    return kept;
  }
}
