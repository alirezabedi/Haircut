"use client";

import { useEffect } from "react";

// Registers the app-shell service worker (public/sw.js) in production only,
// so it never caches stale bundles during development.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installability is a nice-to-have; ignore registration failures.
    });
  }, []);

  return null;
}
