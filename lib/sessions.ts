import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/seed";
import { generation, photo, session, voiceNote } from "@/lib/db/schema";
import type { Angle } from "@/lib/types";

// Session data access. Every lookup is scoped to the shop so one shop can never read another's.

export function createSession(db: Db, shopId: number, consentAt = new Date()) {
  return db.insert(session).values({ shopId, consentAt }).returning().get();
}

export function getSession(db: Db, shopId: number, sessionId: string) {
  return db
    .select()
    .from(session)
    .where(and(eq(session.id, sessionId), eq(session.shopId, shopId)))
    .get();
}

export function getPhotos(db: Db, sessionId: string) {
  return db.select().from(photo).where(eq(photo.sessionId, sessionId)).all();
}

/** Saves (or replaces) the photo for one angle. Returns the previous file name, if any. */
export function upsertPhoto(db: Db, sessionId: string, angle: Angle, path: string): string | null {
  return db.transaction((tx) => {
    const old = tx
      .select()
      .from(photo)
      .where(and(eq(photo.sessionId, sessionId), eq(photo.angle, angle)))
      .get();
    if (old) {
      tx.update(photo).set({ path, createdAt: new Date() }).where(eq(photo.id, old.id)).run();
      return old.path;
    }
    tx.insert(photo).values({ sessionId, angle, path }).run();
    return null;
  });
}

export function addVoiceNote(
  db: Db,
  values: { sessionId: string; path: string; mime: string; durationS: number | null },
) {
  return db.insert(voiceNote).values(values).returning().get();
}

export function setTranscript(db: Db, voiceNoteId: number, transcript: string) {
  db.update(voiceNote).set({ transcript }).where(eq(voiceNote.id, voiceNoteId)).run();
}

export function getVoiceNote(db: Db, sessionId: string, voiceNoteId: number) {
  return db
    .select()
    .from(voiceNote)
    .where(and(eq(voiceNote.id, voiceNoteId), eq(voiceNote.sessionId, sessionId)))
    .get();
}

export function getGenerations(db: Db, sessionId: string) {
  return db
    .select()
    .from(generation)
    .where(eq(generation.sessionId, sessionId))
    .orderBy(desc(generation.id))
    .all();
}
