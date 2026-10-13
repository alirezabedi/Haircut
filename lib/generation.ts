import { and, asc, desc, eq, lt, lte } from "drizzle-orm";
import type { ImageQuality, ImageUsage } from "@/lib/ai/image";
import { imageCost, sumCosts, textCost, transcribeCost } from "@/lib/ai/pricing";
import { buildImagePrompt, type SpecRequest } from "@/lib/ai/prompts";
import type { Photos, TextUsage } from "@/lib/ai/spec";
import { chargeSessionOnce, getBalance } from "@/lib/credits";
import { generation, photo, session, voiceNote } from "@/lib/db/schema";
import type { Db } from "@/lib/db/seed";
import { MAX_GENERATIONS } from "@/lib/tries";
import type { GenerationStatus, HaircutSpec } from "@/lib/types";

// Preview generation (docs/SPEC.md §4, §6). Dependencies are passed in so tests can stub
// OpenAI and the disk.

const IN_FLIGHT: GenerationStatus[] = ["queued", "transcribing", "spec", "imaging"];

export type GenerateInput = { voiceNoteId: number } | { text: string } | { retry: true };

type Fail = { ok: false; status: number; error: string };
type Ok = { ok: true; generationId: number };

/** Validates a "Create preview" / "Try again" request and queues a generation row. */
export function queueGeneration(db: Db, shopId: number, sessionId: string, input: GenerateInput): Ok | Fail {
  const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

  const s = db.select().from(session).where(and(eq(session.id, sessionId), eq(session.shopId, shopId))).get();
  if (!s) return fail(404, "Session not found");
  if (s.status === "approved" || s.status === "abandoned") return fail(409, "This session is finished");

  const gens = db.select().from(generation).where(eq(generation.sessionId, sessionId)).orderBy(asc(generation.id)).all();
  if (gens.some((g) => IN_FLIGHT.includes(g.status))) return fail(409, "A preview is already being made");

  const done = gens.filter((g) => g.status === "done").length;
  if (done >= MAX_GENERATIONS) return fail(409, "No tries left for this customer");

  const photos = db.select({ angle: photo.angle }).from(photo).where(eq(photo.sessionId, sessionId)).all();
  if (photos.length < 4) return fail(409, "Take all four photos first");

  // The credit is taken on the first successful preview, but don't start one we can't pay for.
  if (!s.creditCharged && getBalance(db, shopId) <= 0) return fail(402, "No credits left. Buy more to continue.");

  let text: string | null = null;
  if ("retry" in input) {
    const last = gens.at(-1);
    if (!last || last.status !== "failed") return fail(409, "Nothing to retry");
    text = last.adjustmentText;
  } else if ("voiceNoteId" in input) {
    const note = db
      .select()
      .from(voiceNote)
      .where(and(eq(voiceNote.id, input.voiceNoteId), eq(voiceNote.sessionId, sessionId)))
      .get();
    text = note?.transcript ?? null;
  } else {
    text = input.text.trim().slice(0, 1000);
  }
  if (!text || text.length < 3) return fail(400, "Tell us what you want first");

  const row = db
    .insert(generation)
    .values({ sessionId, attempt: done + 1, adjustmentText: text, status: "queued" })
    .returning()
    .get();
  db.update(session).set({ status: "processing" }).where(eq(session.id, sessionId)).run();
  return { ok: true, generationId: row.id };
}

export type PipelineDeps = {
  db: Db;
  models: { transcribe: string; text: string; image: string };
  imageQuality: ImageQuality;
  extractSpec: (request: SpecRequest, photos: Photos) => Promise<{ spec: HaircutSpec; usage: TextUsage }>;
  generatePreview: (input: {
    front: Buffer;
    left: Buffer;
    right: Buffer;
    prompt: string;
    quality: ImageQuality;
  }) => Promise<{ image: Buffer; usage: ImageUsage }>;
  readMedia: (sessionId: string, file: string) => Promise<Buffer>;
  writeMedia: (sessionId: string, file: string, data: Buffer) => Promise<void>;
};

export type GenerationUsage = {
  transcribe: { model: string; seconds: number; cost_usd: number | null };
  spec: { model: string; usage: TextUsage; cost_usd: number | null } | null;
  image: { model: string; quality: ImageQuality; usage: ImageUsage; cost_usd: number | null } | null;
  total_usd: number | null;
};

/** Runs one queued generation to done or failed. Never throws. */
export async function runGeneration(deps: PipelineDeps, generationId: number): Promise<void> {
  const { db } = deps;
  const g = db.select().from(generation).where(eq(generation.id, generationId)).get();
  if (!g || g.status !== "queued") return;
  const sessionId = g.sessionId;
  const setStatus = (status: GenerationStatus) =>
    db.update(generation).set({ status }).where(eq(generation.id, generationId)).run();

  const usage: GenerationUsage = {
    transcribe: { model: deps.models.transcribe, seconds: 0, cost_usd: 0 },
    spec: null,
    image: null,
    total_usd: null,
  };

  try {
    // 1. Transcribing: voice notes are transcribed on upload; here we account for the audio
    //    recorded since the previous generation (including re-recordings).
    setStatus("transcribing");
    const prev = db
      .select({ createdAt: generation.createdAt })
      .from(generation)
      .where(and(eq(generation.sessionId, sessionId), lt(generation.id, generationId)))
      .orderBy(desc(generation.id))
      .get();
    const notes = db
      .select({ durationS: voiceNote.durationS, createdAt: voiceNote.createdAt })
      .from(voiceNote)
      .where(and(eq(voiceNote.sessionId, sessionId), lte(voiceNote.createdAt, g.createdAt)))
      .all()
      .filter((n) => !prev || n.createdAt > prev.createdAt);
    const seconds = notes.reduce((a, n) => a + (n.durationS ?? 0), 0);
    usage.transcribe = {
      model: deps.models.transcribe,
      seconds: Math.round(seconds * 10) / 10,
      cost_usd: transcribeCost(deps.models.transcribe, seconds),
    };

    // 2. Spec from the request, earlier adjustments and the four photos.
    setStatus("spec");
    const history = db
      .select()
      .from(generation)
      .where(and(eq(generation.sessionId, sessionId), eq(generation.status, "done")))
      .orderBy(asc(generation.id))
      .all();
    const texts = [...history.map((h) => h.adjustmentText ?? ""), g.adjustmentText ?? ""].filter(Boolean);
    const request: SpecRequest = {
      original: texts[0],
      adjustments: texts.slice(1),
      previous: (history.at(-1)?.specJson as HaircutSpec | null) ?? null,
    };

    const rows = db.select().from(photo).where(eq(photo.sessionId, sessionId)).all();
    const byAngle = Object.fromEntries(rows.map((r) => [r.angle, r.path]));
    const photos: Photos = {
      front: await deps.readMedia(sessionId, byAngle.front),
      left: await deps.readMedia(sessionId, byAngle.left),
      right: await deps.readMedia(sessionId, byAngle.right),
      back: await deps.readMedia(sessionId, byAngle.back),
    };

    const { spec, usage: specUsage } = await deps.extractSpec(request, photos);
    usage.spec = { model: deps.models.text, usage: specUsage, cost_usd: textCost(deps.models.text, specUsage) };
    db.update(generation).set({ specJson: spec, usageJson: usage }).where(eq(generation.id, generationId)).run();

    // 3. Image: edit the front photo, side photos as references.
    setStatus("imaging");
    const { image, usage: imageUsage } = await deps.generatePreview({
      front: photos.front,
      left: photos.left,
      right: photos.right,
      prompt: buildImagePrompt(spec),
      quality: deps.imageQuality,
    });
    usage.image = {
      model: deps.models.image,
      quality: deps.imageQuality,
      usage: imageUsage,
      cost_usd: imageCost(deps.models.image, imageUsage),
    };
    usage.total_usd = sumCosts([usage.transcribe.cost_usd, usage.spec.cost_usd, usage.image.cost_usd]);

    const file = `preview-${g.attempt}-${Date.now()}.jpg`;
    await deps.writeMedia(sessionId, file, image);

    // 4. Done: save, mark the session ready and charge the credit if this is its first preview.
    db.transaction((tx) => {
      tx.update(generation)
        .set({ status: "done", imagePath: file, usageJson: usage, finishedAt: new Date() })
        .where(eq(generation.id, generationId))
        .run();
      tx.update(session).set({ status: "ready" }).where(eq(session.id, sessionId)).run();
    });
    chargeSessionOnce(db, sessionId);
  } catch (e) {
    console.error(`generation ${generationId} failed`, e);
    // Failed generations cost no credit and no try (docs/SPEC.md §4).
    const anyDone = db
      .select({ id: generation.id })
      .from(generation)
      .where(and(eq(generation.sessionId, sessionId), eq(generation.status, "done")))
      .get();
    usage.total_usd = sumCosts([usage.transcribe.cost_usd, usage.spec?.cost_usd ?? 0, usage.image?.cost_usd ?? 0]);
    db.update(generation)
      .set({
        status: "failed",
        error: e instanceof Error ? e.message.slice(0, 500) : "Unknown error",
        usageJson: usage,
        finishedAt: new Date(),
      })
      .where(eq(generation.id, generationId))
      .run();
    db.update(session)
      .set({ status: anyDone ? "ready" : "capturing" })
      .where(eq(session.id, sessionId))
      .run();
  }
}
