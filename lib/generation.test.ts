import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBalance } from "@/lib/credits";
import { creditLedger, generation, photo, session, voiceNote } from "@/lib/db/schema";
import { type Db, seedFirstShop } from "@/lib/db/seed";
import { type PipelineDeps, queueGeneration, runGeneration } from "@/lib/generation";
import { createSession } from "@/lib/sessions";
import { freshDb } from "@/lib/test-db";
import type { HaircutSpec } from "@/lib/types";

const SPEC: HaircutSpec = {
  name: "Skin fade, textured top",
  sides: "Skin fade, #0.5 → #2",
  top: "About 5 cm, textured",
  back: "Tapered",
  neckline: "Natural",
  beard: "Leave as is",
  notes: "",
  feasibility_warning: "",
};

let db: Db;
let sessionId: string;

function deps(overrides: Partial<PipelineDeps> = {}): PipelineDeps {
  return {
    db,
    models: { transcribe: "gpt-transcribe", text: "gpt-6-luna", image: "gpt-image-2.5-sunburst" },
    imageQuality: "medium",
    extractSpec: vi.fn().mockResolvedValue({ spec: SPEC, usage: { input_tokens: 5000, cached_tokens: 0, output_tokens: 200 } }),
    generatePreview: vi.fn().mockResolvedValue({
      image: Buffer.from("jpeg"),
      usage: { text_input_tokens: 400, image_input_tokens: 4600, output_tokens: 1300 },
    }),
    readMedia: vi.fn().mockResolvedValue(Buffer.from("photo")),
    writeMedia: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function generate(input = { text: "Skin fade please" }, d = deps()) {
  const q = queueGeneration(db, 1, sessionId, input);
  if (!q.ok) throw new Error(q.error);
  await runGeneration(d, q.generationId);
  return db.select().from(generation).where(eq(generation.id, q.generationId)).get()!;
}

beforeEach(() => {
  db = freshDb();
  seedFirstShop(db);
  sessionId = createSession(db, 1).id;
  for (const angle of ["front", "left", "right", "back"] as const) {
    db.insert(photo).values({ sessionId, angle, path: `photo-${angle}-1.jpg` }).run();
  }
});

describe("credits and tries", () => {
  it("charges 1 credit on the first successful preview, and tries are free", async () => {
    expect(getBalance(db, 1)).toBe(100);
    await generate();
    expect(getBalance(db, 1)).toBe(99);
    await generate({ text: "Shorter on top" });
    await generate({ text: "Softer fade" });
    expect(getBalance(db, 1)).toBe(99);
    const charges = db.select().from(creditLedger).where(eq(creditLedger.reason, "session")).all();
    expect(charges).toHaveLength(1);
    expect(charges[0].sessionId).toBe(sessionId);
  });

  it("allows 3 previews per customer (1 + 2 tries)", async () => {
    await generate();
    await generate({ text: "Shorter" });
    await generate({ text: "Shorter still" });
    expect(queueGeneration(db, 1, sessionId, { text: "Again" })).toMatchObject({ ok: false, status: 409 });
  });

  it("failed generations cost no credit and no try", async () => {
    const broken = deps({ generatePreview: vi.fn().mockRejectedValue(new Error("image API down")) });
    const failed = await generate(undefined, broken);
    expect(failed.status).toBe("failed");
    expect(failed.error).toBe("image API down");
    expect(getBalance(db, 1)).toBe(100);
    expect(db.select().from(session).get()!.status).toBe("capturing");

    // Retry reuses the same request and still counts as the first preview.
    const q = queueGeneration(db, 1, sessionId, { retry: true });
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    await runGeneration(deps(), q.generationId);
    const ok = db.select().from(generation).where(eq(generation.id, q.generationId)).get()!;
    expect(ok).toMatchObject({ status: "done", attempt: 1, adjustmentText: "Skin fade please" });
    expect(getBalance(db, 1)).toBe(99);
  });

  it("won't start a first preview with no credits", () => {
    db.insert(creditLedger).values({ shopId: 1, delta: -100, reason: "session" }).run();
    expect(queueGeneration(db, 1, sessionId, { text: "Skin fade" })).toMatchObject({ ok: false, status: 402 });
  });

  it("lets a charged session keep trying even at zero credits", async () => {
    await generate();
    db.insert(creditLedger).values({ shopId: 1, delta: -99, reason: "session" }).run();
    expect(getBalance(db, 1)).toBe(0);
    expect(queueGeneration(db, 1, sessionId, { text: "Shorter" }).ok).toBe(true);
  });
});

describe("queueGeneration", () => {
  it("refuses a second job while one is running", () => {
    expect(queueGeneration(db, 1, sessionId, { text: "Skin fade" }).ok).toBe(true);
    expect(queueGeneration(db, 1, sessionId, { text: "Again" })).toMatchObject({ ok: false, status: 409 });
  });

  it("needs all four photos", () => {
    const other = createSession(db, 1).id;
    expect(queueGeneration(db, 1, other, { text: "Skin fade" })).toMatchObject({ ok: false, status: 409 });
  });

  it("uses the transcript of the session's own voice note only", () => {
    const note = db.insert(voiceNote).values({ sessionId, path: "voice-1.webm", mime: "audio/webm", durationS: 20, transcript: "Buzz cut" }).returning().get();
    const other = createSession(db, 1).id;
    expect(queueGeneration(db, 1, other, { voiceNoteId: note.id }).ok).toBe(false);
    const q = queueGeneration(db, 1, sessionId, { voiceNoteId: note.id });
    expect(q.ok).toBe(true);
  });

  it("can't touch another shop's session", () => {
    expect(queueGeneration(db, 2, sessionId, { text: "Skin fade" })).toMatchObject({ ok: false, status: 404 });
  });
});

describe("runGeneration", () => {
  it("passes earlier requests and the last spec when adjusting", async () => {
    await generate({ text: "Skin fade please" });
    const d = deps();
    await generate({ text: "Shorter on top" }, d);
    expect(d.extractSpec).toHaveBeenCalledWith(
      { original: "Skin fade please", adjustments: ["Shorter on top"], previous: SPEC },
      expect.any(Object),
    );
  });

  it("logs usage and estimated cost on the generation row", async () => {
    db.insert(voiceNote).values({ sessionId, path: "voice-1.webm", mime: "audio/webm", durationS: 60, transcript: "Skin fade" }).run();
    const g = await generate();
    const usage = g.usageJson as { transcribe: { seconds: number; cost_usd: number }; total_usd: number };
    expect(usage.transcribe.seconds).toBe(60);
    expect(usage.transcribe.cost_usd).toBeCloseTo(0.0045);
    // 5000×0.10 + 200×0.50 per M for text; 400×5 + 4600×8 + 1300×30 per M for the image.
    expect(usage.total_usd).toBeCloseTo(0.0045 + 0.0006 + 0.0778, 5);
    expect(g.imagePath).toMatch(/^preview-1-\d+\.jpg$/);
    expect(db.select().from(session).get()!.status).toBe("ready");
  });
});
