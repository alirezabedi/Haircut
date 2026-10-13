import { and, desc, eq, sql } from "drizzle-orm";
import { creditLedger, generation, session } from "@/lib/db/schema";
import type { Db } from "@/lib/db/seed";
import type { HaircutSpec, SessionStatus } from "@/lib/types";

// Credits (docs/SPEC.md §4): balance = sum of the ledger; every change is a ledger row.

export function getBalance(db: Db, shopId: number): number {
  const row = db
    .select({ total: sql<number>`coalesce(sum(${creditLedger.delta}), 0)` })
    .from(creditLedger)
    .where(eq(creditLedger.shopId, shopId))
    .get();
  return row?.total ?? 0;
}

/**
 * Charges 1 credit for a customer session, once, when its first preview succeeds.
 * Later tries on the same session are free. Returns true if a credit was taken now.
 */
export function chargeSessionOnce(db: Db, sessionId: string): boolean {
  return db.transaction((tx) => {
    const s = tx.select().from(session).where(eq(session.id, sessionId)).get();
    if (!s || s.creditCharged) return false;
    tx.insert(creditLedger).values({ shopId: s.shopId, delta: -1, reason: "session", sessionId }).run();
    tx.update(session).set({ creditCharged: true }).where(eq(session.id, sessionId)).run();
    return true;
  });
}

/** A new customer session (or its first preview) needs at least one credit. */
export function canStartSession(db: Db, shopId: number): boolean {
  return getBalance(db, shopId) > 0;
}

export type HistoryRow = {
  sessionId: string;
  name: string;
  imagePath: string | null;
  createdAt: Date;
  status: SessionStatus;
};

/** The last `limit` sessions that produced a preview, newest first, with their latest preview. */
export function recentHistory(db: Db, shopId: number, limit = 20): HistoryRow[] {
  const rows = db
    .select({
      sessionId: session.id,
      createdAt: session.createdAt,
      status: session.status,
      specJson: generation.specJson,
      imagePath: generation.imagePath,
    })
    .from(generation)
    .innerJoin(session, eq(generation.sessionId, session.id))
    .where(and(eq(session.shopId, shopId), eq(generation.status, "done")))
    .orderBy(desc(session.createdAt), desc(generation.id))
    .limit(limit * 3)
    .all();

  const seen = new Set<string>();
  const out: HistoryRow[] = [];
  for (const r of rows) {
    if (seen.has(r.sessionId)) continue;
    seen.add(r.sessionId);
    out.push({
      sessionId: r.sessionId,
      name: (r.specJson as HaircutSpec | null)?.name ?? "Preview",
      imagePath: r.imagePath,
      createdAt: r.createdAt,
      status: r.status,
    });
    if (out.length === limit) break;
  }
  return out;
}
