import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireShopId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSession } from "@/lib/sessions";
import type { SessionStatus } from "@/lib/types";

const HOME: Record<SessionStatus, (id: string) => string> = {
  capturing: (id) => `/s/${id}/photos`,
  processing: (id) => `/s/${id}/processing`,
  ready: (id) => `/s/${id}/result`,
  approved: (id) => `/s/${id}/result?from=history`,
  abandoned: (id) => `/s/${id}/result?from=history`,
};

/** Loads the shop's session for a page, 404s for anyone else's, and checks the step is allowed. */
export async function loadSessionPage(id: string, allowed: SessionStatus[]) {
  const shopId = await requireShopId();
  const s = getSession(db, shopId, id);
  if (!s) notFound();
  if (!allowed.includes(s.status)) redirect(HOME[s.status](id));
  return { shopId, session: s };
}
