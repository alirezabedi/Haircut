"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The current time on the client, or null during server render and hydration.
 * Lets components say "Today"/"Yesterday" without a server/client mismatch.
 */
export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => nowSnapshot(),
    () => null,
  );
}

// Cached per minute so useSyncExternalStore sees a stable snapshot.
let cached: Date | null = null;
function nowSnapshot() {
  const t = Date.now();
  if (!cached || t - cached.getTime() > 60_000) cached = new Date(t);
  return cached;
}
