"use client";

// M1 only: an in-memory stand-in for the session row, so the static screens click
// through end to end. Replaced by real sessions in M2.
import { createContext, useContext, useState } from "react";
import { useCredits } from "@/components/credits/credits-provider";
import type { Angle } from "@/lib/fake-data";

type DemoSession = {
  photos: Angle[];
  /** Successful previews so far (1 = first preview, 2–3 = tries). */
  generations: number;
  creditCharged: boolean;
};

type DemoSessionValue = DemoSession & {
  takePhoto: (angle: Angle) => void;
  /** Called when a preview finishes: counts the generation and charges 1 credit on the first. */
  completeGeneration: () => void;
  /** Approve (or abandon): back to a fresh session. */
  reset: () => void;
};

const EMPTY: DemoSession = { photos: [], generations: 0, creditCharged: false };

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DemoSession>(EMPTY);
  const { charge } = useCredits();

  const value: DemoSessionValue = {
    ...session,
    takePhoto: (angle) =>
      setSession((s) => (s.photos.includes(angle) ? s : { ...s, photos: [...s.photos, angle] })),
    completeGeneration: () => {
      if (!session.creditCharged) charge();
      setSession((s) => ({ ...s, generations: s.generations + 1, creditCharged: true }));
    },
    reset: () => setSession(EMPTY),
  };

  return <DemoSessionContext value={value}>{children}</DemoSessionContext>;
}

export function useDemoSession() {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) throw new Error("useDemoSession must be used inside <DemoSessionProvider>");
  return ctx;
}
