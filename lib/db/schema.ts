// Data model from docs/SPEC.md §7.
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const shop = sqliteTable("shop", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

export const creditLedger = sqliteTable(
  "credit_ledger",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shop.id),
    delta: integer("delta").notNull(),
    reason: text("reason", { enum: ["seed", "purchase", "session"] }).notNull(),
    stripeEventId: text("stripe_event_id"),
    sessionId: text("session_id").references(() => session.id),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("credit_ledger_stripe_event_id_unique").on(t.stripeEventId),
    index("credit_ledger_shop_id_idx").on(t.shopId),
  ],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shop.id),
    status: text("status", {
      enum: ["capturing", "processing", "ready", "approved", "abandoned"],
    })
      .notNull()
      .default("capturing"),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    creditCharged: integer("credit_charged", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [index("session_shop_created_idx").on(t.shopId, t.createdAt)],
);

export const photo = sqliteTable(
  "photo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => session.id),
    angle: text("angle", { enum: ["front", "left", "right", "back"] }).notNull(),
    path: text("path").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("photo_session_angle_unique").on(t.sessionId, t.angle)],
);

export const voiceNote = sqliteTable(
  "voice_note",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => session.id),
    path: text("path").notNull(),
    mime: text("mime").notNull(),
    durationS: real("duration_s"),
    transcript: text("transcript"),
    createdAt: createdAt(),
  },
  (t) => [index("voice_note_session_idx").on(t.sessionId)],
);

export const generation = sqliteTable(
  "generation",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => session.id),
    attempt: integer("attempt").notNull(),
    adjustmentText: text("adjustment_text"),
    status: text("status", {
      enum: ["queued", "transcribing", "spec", "imaging", "done", "failed"],
    })
      .notNull()
      .default("queued"),
    specJson: text("spec_json", { mode: "json" }),
    imagePath: text("image_path"),
    error: text("error"),
    usageJson: text("usage_json", { mode: "json" }),
    createdAt: createdAt(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("generation_session_idx").on(t.sessionId),
    check("generation_attempt_range", sql`${t.attempt} between 1 and 3`),
  ],
);
