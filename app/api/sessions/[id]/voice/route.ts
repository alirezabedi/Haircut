import { model, openai } from "@/lib/ai/client";
import { audioExtension, transcribe } from "@/lib/ai/transcribe";
import { jsonError, loadSessionForRequest } from "@/lib/api";
import { db } from "@/lib/db";
import { readBody, writeMedia } from "@/lib/media";
import { addVoiceNote, setTranscript } from "@/lib/sessions";

const MAX_BYTES = 20 * 1024 * 1024; // 90 s of audio is ~1–2 MB; OpenAI's limit is 25 MB

// POST the recorded audio (Content-Type = recorder MIME, ?duration=seconds).
// Saves it, transcribes it straight away and returns the transcript for "What we heard".
export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/voice">) {
  const { id } = await ctx.params;
  const loaded = await loadSessionForRequest(id);
  if ("error" in loaded) return loaded.error;
  if (loaded.session.status === "approved") return jsonError("This session is finished", 409);

  const mime = request.headers.get("content-type") ?? "";
  const ext = audioExtension(mime);
  if (!ext) return jsonError("Unsupported audio format", 415);

  const body = await readBody(request, MAX_BYTES);
  if (!body) return jsonError("Recording is empty or too large", 400);

  const duration = Number(new URL(request.url).searchParams.get("duration"));
  const file = `voice-${Date.now()}.${ext}`;
  await writeMedia(id, file, body);
  const note = addVoiceNote(db, {
    sessionId: id,
    path: file,
    mime: mime.split(";")[0],
    durationS: Number.isFinite(duration) && duration > 0 ? Math.min(duration, 120) : null,
  });

  try {
    const text = await transcribe(openai(), model("transcribe"), body, mime);
    if (!text) return jsonError("We couldn’t hear anything. Try again a bit closer to the phone.", 422);
    setTranscript(db, note.id, text);
    return Response.json({ voiceNoteId: note.id, transcript: text });
  } catch (e) {
    console.error("transcription failed", e);
    return jsonError("We couldn’t hear that. Record again or type it.", 502);
  }
}
