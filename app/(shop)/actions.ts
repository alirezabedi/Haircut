"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireShopId } from "@/lib/auth/session";
import { canStartSession } from "@/lib/credits";
import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { createSession, getSession } from "@/lib/sessions";

export type StartState = { error: string } | null;

/** Start: needs the consent tick and at least one credit. Stores consent_at. */
export async function startSession(_prev: StartState, formData: FormData): Promise<StartState> {
  const shopId = await requireShopId();
  if (formData.get("consent") !== "on") return { error: "Tick the box to agree before you start." };
  if (!canStartSession(db, shopId)) return { error: "No credits left. Buy more to start." };

  const s = createSession(db, shopId, new Date());
  redirect(`/s/${s.id}/photos`);
}

/** Approve this cut: marks the session approved and returns to Start for the next customer. */
export async function approveSession(sessionId: string): Promise<void> {
  const shopId = await requireShopId();
  const s = getSession(db, shopId, sessionId);
  if (s && s.status === "ready") {
    db.update(session)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(session.id, sessionId))
      .run();
  }
  redirect("/");
}
