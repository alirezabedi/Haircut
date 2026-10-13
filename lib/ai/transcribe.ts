import OpenAI, { toFile } from "openai";

const EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

/** File extension for a recorded audio MIME type (codecs suffix ignored), or null if unsupported. */
export function audioExtension(mime: string): string | null {
  return EXT[mime.split(";")[0].trim().toLowerCase()] ?? null;
}

/** Transcribes an English voice note. The client is passed in so tests can stub it. */
export async function transcribe(
  client: OpenAI,
  modelId: string,
  audio: Buffer,
  mime: string,
): Promise<string> {
  const ext = audioExtension(mime) ?? "webm";
  const result = await client.audio.transcriptions.create({
    model: modelId,
    file: await toFile(audio, `voice.${ext}`, { type: mime.split(";")[0] }),
    languages: ["en"],
  });
  return result.text.trim();
}
