import "server-only";
import { model, openai } from "@/lib/ai/client";
import { generatePreview, imageQuality } from "@/lib/ai/image";
import { extractSpec } from "@/lib/ai/spec";
import { db } from "@/lib/db";
import { runGeneration, type PipelineDeps } from "@/lib/generation";
import { readMedia, writeMedia } from "@/lib/media";

// In-process job runner (docs/SPEC.md §6): the generate route queues a row and starts it
// here without waiting. One Node process serves the shop, and queueGeneration refuses a
// second job for the same session while one is in flight.

function deps(): PipelineDeps {
  const client = openai();
  const models = { transcribe: model("transcribe"), text: model("text"), image: model("image") };
  return {
    db,
    models,
    imageQuality: imageQuality(),
    extractSpec: (request, photos) => extractSpec(client, models.text, request, photos),
    generatePreview: (input) => generatePreview(client, models.image, input),
    readMedia,
    writeMedia,
  };
}

export function startGenerationJob(generationId: number): void {
  void runGeneration(deps(), generationId);
}
