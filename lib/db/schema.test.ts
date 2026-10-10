import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, expect, it } from "vitest";
import * as schema from "./schema";

function freshDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db;
}

describe("database schema", () => {
  it("applies migrations and round-trips a session", () => {
    const db = freshDb();
    const [s] = db.insert(schema.shop).values({ name: "Test shop" }).returning().all();
    const [sess] = db
      .insert(schema.session)
      .values({ shopId: s.id, consentAt: new Date() })
      .returning()
      .all();

    expect(sess.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(sess.status).toBe("capturing");
    expect(sess.creditCharged).toBe(false);
  });

  it("rejects a generation attempt outside 1–3", () => {
    const db = freshDb();
    const [s] = db.insert(schema.shop).values({ name: "Test shop" }).returning().all();
    const [sess] = db
      .insert(schema.session)
      .values({ shopId: s.id, consentAt: new Date() })
      .returning()
      .all();

    expect(() =>
      db.insert(schema.generation).values({ sessionId: sess.id, attempt: 4 }).run(),
    ).toThrow(/CHECK constraint/);
  });

  it("keeps stripe_event_id unique but allows many nulls", () => {
    const db = freshDb();
    const [s] = db.insert(schema.shop).values({ name: "Test shop" }).returning().all();
    db.insert(schema.creditLedger).values({ shopId: s.id, delta: 100, reason: "seed" }).run();
    db.insert(schema.creditLedger).values({ shopId: s.id, delta: 100, reason: "purchase" }).run();
    db.insert(schema.creditLedger)
      .values({ shopId: s.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" })
      .run();

    expect(() =>
      db.insert(schema.creditLedger)
        .values({ shopId: s.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" })
        .run(),
    ).toThrow(/UNIQUE/);
  });
});
