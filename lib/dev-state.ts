"use client";

import { useEffect, useState } from "react";

// Dev-only preview states, set with ?state=… in the URL. Always null in production builds.
export const DEV_STATES = ["no-credits", "low-credits", "warning", "error"] as const;
export type DevState = (typeof DEV_STATES)[number];

export function readDevState(search: string): DevState | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = new URLSearchParams(search).get("state");
  return (DEV_STATES as readonly string[]).includes(value ?? "") ? (value as DevState) : null;
}

/** Reads ?state= after mount (null on the server and in production). */
export function useDevState(): DevState | null {
  const [state, setState] = useState<DevState | null>(null);
  useEffect(() => {
    // Reading the URL after mount keeps server and client markup identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readDevState(window.location.search));
  }, []);
  return state;
}
