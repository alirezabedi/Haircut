import { beforeEach, describe, expect, it } from "vitest";
import { canStartSession, chargeSessionOnce, getBalance, recentHistory } from "@/lib/credits";
import { creditLedger, generation } from "@/lib/db/schema";
import { type Db, SEED_CREDITS, seedFirstShop } from "@/lib/db/seed";
import { createSession } from "@/lib/sessions";
import { freshDb } from "@/lib/test-db";

let db: Db;

beforeEach(() => {
  db = freshDb();
  seedFirstShop(db);
});

describe("ledger", () => {
  it("seeds the first shop with 100 credits once", () => {
    expect(getBalance(db, 1)).toBe(SEED_CREDITS);
    expect(seedFirstShop(db)).toBe(false);
    expect(getBalance(db, 1)).toBe(100);
  });

  it("balance is the sum of ledger rows", () => {
    db.insert(creditLedger).values({ shopId: 1, delta: 100, reason: "purchase" }).run();
    db.insert(creditLedger).values({ shopId: 1, delta: -1, reason: "session" }).run();
    expect(getBalance(db, 1)).toBe(199);
    expect(getBalance(db, 2)).toBe(0);
  });

  it("charges a session once, however often it's called", () => {
    const s = createSession(db, 1);
    expect(chargeSessionOnce(db, s.id)).toBe(true);
    expect(chargeSessionOnce(db, s.id)).toBe(false);
    expect(getBalance(db, 1)).toBe(99);
  });

  it("can't start a session at zero credits", () => {
    expect(canStartSession(db, 1)).toBe(true);
    db.insert(creditLedger).values({ shopId: 1, delta: -100, reason: "session" }).run();
    expect(canStartSession(db, 1)).toBe(false);
  });
});

describe("recentHistory", () => {
  function preview(sessionId: string, name: string, imagePath: string | null = "preview.jpg") {
    db.insert(generation)
      .values({ sessionId, attempt: 1, status: "done", imagePath, specJson: { name } })
      .run();
  }

  it("lists sessions with a preview, newest first, with their latest preview", () => {
    const older = createSession(db, 1, new Date("2026-10-01T10:00:00Z"));
    const newer = createSession(db, 1, new Date("2026-10-02T10:00:00Z"));
    createSession(db, 1); // no preview: not listed
    preview(older.id, "Buzz cut");
    preview(newer.id, "Skin fade");
    preview(newer.id, "Skin fade, shorter top", "preview-2.jpg");
    db.insert(generation).values({ sessionId: older.id, attempt: 2, status: "failed" }).run();

    const h = recentHistory(db, 1);
    expect(h.map((x) => x.name)).toEqual(["Skin fade, shorter top", "Buzz cut"]);
    expect(h[0].imagePath).toBe("preview-2.jpg");
  });

  it("returns at most 20", () => {
    for (let i = 0; i < 25; i++) preview(createSession(db, 1).id, `Cut ${i}`);
    expect(recentHistory(db, 1)).toHaveLength(20);
  });

  it("only shows the shop's own sessions", () => {
    preview(createSession(db, 1).id, "Skin fade");
    expect(recentHistory(db, 2)).toEqual([]);
  });
});
