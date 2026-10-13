import { jsonError, loadSessionForRequest } from "@/lib/api";
import { db } from "@/lib/db";
import { deleteMedia, isJpeg, mediaUrl, readBody, writeMedia } from "@/lib/media";
import { upsertPhoto } from "@/lib/sessions";
import { ANGLES, type Angle } from "@/lib/types";

const MAX_BYTES = 6 * 1024 * 1024; // resized client-side to ≤1536px, so far smaller in practice

// POST a JPEG body (already resized and EXIF-stripped in the browser) for one angle.
export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/photos/[angle]">) {
  const { id, angle } = await ctx.params;
  if (!ANGLES.includes(angle as Angle)) return jsonError("Unknown angle", 400);

  const loaded = await loadSessionForRequest(id);
  if ("error" in loaded) return loaded.error;
  if (loaded.session.status !== "capturing") return jsonError("Photos are locked for this session", 409);

  const body = await readBody(request, MAX_BYTES);
  if (!body || !isJpeg(body)) return jsonError("Send a JPEG under 6 MB", 400);

  const file = `photo-${angle}-${Date.now()}.jpg`;
  await writeMedia(id, file, body);
  const old = upsertPhoto(db, id, angle as Angle, file);
  if (old) await deleteMedia(id, old);

  return Response.json({ url: mediaUrl(id, file) });
}
