import { jsonError, loadSessionForRequest } from "@/lib/api";
import { CONTENT_TYPE, mediaPath, readMedia } from "@/lib/media";

// Serves a session's photos, audio and previews to the logged-in shop only.
export async function GET(_request: Request, ctx: RouteContext<"/api/media/[sessionId]/[file]">) {
  const { sessionId, file } = await ctx.params;
  if (!mediaPath(sessionId, file)) return jsonError("Not found", 404);

  const loaded = await loadSessionForRequest(sessionId);
  if ("error" in loaded) return loaded.error;

  try {
    const data = await readMedia(sessionId, file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPE[file.split(".").pop()!] ?? "application/octet-stream",
        // File names change on every upload, so the browser may keep them; never shared caches.
        "Cache-Control": "private, max-age=86400, immutable",
      },
    });
  } catch {
    return jsonError("Not found", 404);
  }
}
