import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

// Uploaded and generated media live on disk at ./data/media/<sessionId>/<file> and are
// served only through the authenticated /api/media route (docs/SPEC.md §8).
export const MEDIA_ROOT = path.join(process.cwd(), "data", "media");

const SESSION_ID = /^[0-9a-f-]{36}$/;
const FILE_NAME = /^[a-z0-9-]+\.(jpg|webm|mp4|m4a|ogg|wav)$/;

export const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  webm: "audio/webm",
  mp4: "audio/mp4",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
};

/** Absolute path for a media file, or null if the ids don't look safe. */
export function mediaPath(sessionId: string, file: string): string | null {
  if (!SESSION_ID.test(sessionId) || !FILE_NAME.test(file)) return null;
  return path.join(MEDIA_ROOT, sessionId, file);
}

export function mediaUrl(sessionId: string, file: string): string {
  return `/api/media/${sessionId}/${file}`;
}

export async function writeMedia(sessionId: string, file: string, data: Buffer): Promise<void> {
  const p = mediaPath(sessionId, file);
  if (!p) throw new Error("Bad media path");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, data);
}

export async function readMedia(sessionId: string, file: string): Promise<Buffer> {
  const p = mediaPath(sessionId, file);
  if (!p) throw new Error("Bad media path");
  return fs.readFile(p);
}

export async function deleteMedia(sessionId: string, file: string): Promise<void> {
  const p = mediaPath(sessionId, file);
  if (p) await fs.rm(p, { force: true });
}

/** Reads the whole request body, refusing anything over `maxBytes`. */
export async function readBody(request: Request, maxBytes: number): Promise<Buffer | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return null;
  const buf = Buffer.from(await request.arrayBuffer());
  return buf.length > 0 && buf.length <= maxBytes ? buf : null;
}

export const isJpeg = (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
