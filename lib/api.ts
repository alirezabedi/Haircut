import "server-only";
import { getShopId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSession } from "@/lib/sessions";

export const jsonError = (error: string, status: number) => Response.json({ error }, { status });

/** Auth + ownership check for /api/sessions/[id]/… routes. */
export async function loadSessionForRequest(sessionId: string) {
  const shopId = await getShopId();
  if (shopId === null) return { error: jsonError("Not logged in", 401) } as const;
  const s = getSession(db, shopId, sessionId);
  if (!s) return { error: jsonError("Session not found", 404) } as const;
  return { shopId, session: s } as const;
}
