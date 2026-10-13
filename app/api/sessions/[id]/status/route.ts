import { loadSessionForRequest } from "@/lib/api";
import { db } from "@/lib/db";
import { getGenerations } from "@/lib/sessions";

// Polled every 2 s by the Processing screen.
export async function GET(_request: Request, ctx: RouteContext<"/api/sessions/[id]/status">) {
  const { id } = await ctx.params;
  const loaded = await loadSessionForRequest(id);
  if ("error" in loaded) return loaded.error;

  const latest = getGenerations(db, id)[0];
  return Response.json(
    { status: latest?.status ?? null, attempt: latest?.attempt ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
