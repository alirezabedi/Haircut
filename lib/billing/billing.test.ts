import { describe, expect, it } from "vitest";
import { getBilling, PACK_CREDITS } from "@/lib/billing";
import { getBalance } from "@/lib/credits";
import { creditLedger } from "@/lib/db/schema";
import { seedFirstShop } from "@/lib/db/seed";
import { freshDb } from "@/lib/test-db";

describe("mock billing", () => {
  it("adds 100 credits through the ledger and completes immediately", async () => {
    const db = freshDb();
    seedFirstShop(db);
    db.insert(creditLedger).values({ shopId: 1, delta: -100, reason: "session" }).run();
    expect(getBalance(db, 1)).toBe(0);

    await expect(getBilling(db).createPurchase(1)).resolves.toEqual({ completed: true });

    expect(getBalance(db, 1)).toBe(PACK_CREDITS);
    const rows = db.select().from(creditLedger).all();
    expect(rows.at(-1)).toMatchObject({ shopId: 1, delta: 100, reason: "purchase", stripeEventId: null });
  });

  it("adds a separate ledger row for each purchase", async () => {
    const db = freshDb();
    seedFirstShop(db);
    await getBilling(db).createPurchase(1);
    await getBilling(db).createPurchase(1);
    expect(getBalance(db, 1)).toBe(300);
  });
});
