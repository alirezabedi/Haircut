"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { CreditsSheet } from "@/components/credits/credits-sheet";
import type { SessionStatus } from "@/lib/types";

export type HistoryEntry = {
  sessionId: string;
  name: string;
  thumbnail: string | null;
  createdAt: number;
  status: SessionStatus;
};

type CreditsContextValue = {
  remaining: number;
  history: HistoryEntry[];
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Buys 100 credits through the billing interface. Resolves true once they're added. */
  buy: () => Promise<boolean>;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

/** Balance and history come from the server layout; this holds the sheet state. */
export function CreditsProvider({
  remaining,
  history,
  children,
}: {
  remaining: number;
  history: HistoryEntry[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function buy(): Promise<boolean> {
    const res = await fetch("/api/credits/purchase", { method: "POST" });
    if (!res.ok) return false;
    const result = (await res.json()) as { redirectUrl?: string; completed?: boolean };
    // A future Stripe implementation returns a checkout URL instead of completing here.
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return false;
    }
    router.refresh();
    return Boolean(result.completed);
  }

  return (
    <CreditsContext value={{ remaining, history, open, setOpen, buy }}>
      {children}
      <CreditsSheet />
    </CreditsContext>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used inside <CreditsProvider>");
  return ctx;
}
