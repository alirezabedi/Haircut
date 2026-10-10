"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CreditsSheet } from "@/components/credits/credits-sheet";
import { readDevState } from "@/lib/dev-state";
import { fakeCredits } from "@/lib/fake-data";

type CreditsContextValue = {
  remaining: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Fake purchase for M1: adds 100 credits locally. Real billing arrives in M5. */
  buy: () => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [remaining, setRemaining] = useState(fakeCredits.remaining);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Dev-only ?state=no-credits / low-credits. Read after mount so markup matches the server.
    const state = readDevState(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (state === "no-credits") {
      setRemaining(0);
      setOpen(true);
    } else if (state === "low-credits") {
      setRemaining(6);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const value: CreditsContextValue = {
    remaining,
    open,
    setOpen,
    buy: () => setRemaining((n) => n + 100),
  };

  return (
    <CreditsContext value={value}>
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
