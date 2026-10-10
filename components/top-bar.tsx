"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreditCounter } from "@/components/credit-counter";
import { useCredits } from "@/components/credits/credits-provider";

type Props = {
  /** Left side: a back link (`backHref`) or custom content such as the wordmark. */
  backHref?: string;
  left?: React.ReactNode;
  /** Centre (or left, when there is no back link) step label, e.g. "Step 1 of 3". */
  step?: string;
};

export function TopBar({ backHref, left, step }: Props) {
  const { remaining, total, setOpen } = useCredits();
  return (
    <header className="flex h-11 items-center justify-between">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="-ml-3 flex size-11 items-center justify-center text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          <ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden />
        </Link>
      ) : (
        left
      )}
      {step && <span className="type-label text-muted-foreground">{step}</span>}
      {!backHref && !left && !step && <span />}
      <CreditCounter remaining={remaining} total={total} onOpen={() => setOpen(true)} />
    </header>
  );
}

export function Wordmark() {
  return <span className="font-serif text-xl">Haircut</span>;
}
