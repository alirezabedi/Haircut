import { jsonError } from "@/lib/api";
import { getShopId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { queueGeneration, type GenerateInput } from "@/lib/generation";
import { startGenerationJob } from "@/lib/jobs";

// POST { voiceNoteId } | { text } | { retry: true } → queues a preview and starts it in the
// background. The Processing screen then polls /status.
export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/generate">) {
  const { id } = await ctx.params;
  const shopId = await getShopId();
  if (shopId === null) return jsonError("Not logged in", 401);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  let input: GenerateInput;
  if (body?.retry === true) input = { retry: true };
  else if (typeof body?.voiceNoteId === "number") input = { voiceNoteId: body.voiceNoteId };
  else if (typeof body?.text === "string") input = { text: body.text };
  else return jsonError("Tell us what you want first", 400);

  const result = queueGeneration(db, shopId, id, input);
  if (!result.ok) return jsonError(result.error, result.status);
  startGenerationJob(result.generationId);
  return Response.json({ generationId: result.generationId }, { status: 202 });
}
