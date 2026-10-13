import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const SEED_CREDITS = 100;

/** Creates the first shop with its 100-credit seed. No-op if a shop exists. Returns true if seeded. */
export function seedFirstShop(db: Db, name = "[Shop name]"): boolean {
  return db.transaction((tx) => {
    if (tx.select({ id: schema.shop.id }).from(schema.shop).limit(1).get()) return false;
    const created = tx.insert(schema.shop).values({ name }).returning().get();
    tx.insert(schema.creditLedger)
      .values({ shopId: created.id, delta: SEED_CREDITS, reason: "seed" })
      .run();
    return true;
  });
}
