"use client";

import { useRouter } from "next/navigation";
import { Fragment } from "react";

/**
 * With cacheComponents, Next keeps visited pages alive (React Activity), so a screen
 * would come back with its old state, e.g. last customer's consent tick or transcript.
 * Keying on bfcacheId resets the screen on every forward navigation (Link, push,
 * replace) while browser back/forward still restores it. Render it inside a page.
 */
export function Fresh({ children }: { children: React.ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
