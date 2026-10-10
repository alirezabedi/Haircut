"use client";

import { useState } from "react";
import { LOW_CREDITS } from "@/components/credit-counter";
import { useCredits } from "@/components/credits/credits-provider";
import { HistoryItem } from "@/components/history-item";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { fakeHistory } from "@/lib/fake-data";
import { cn } from "@/lib/utils";

/** Bottom sheet: credits left, "Buy 100 more", and the last 20 sessions. */
export function CreditsSheet() {
  const { remaining, total, open, setOpen, buy } = useCredits();
  const [justBought, setJustBought] = useState(false);
  const low = remaining <= LOW_CREDITS;
  const fill = Math.min(100, Math.max(0, (remaining / total) * 100));

  const balance = (
    <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-4xl leading-10 font-medium">{remaining}</span>
        <span className="type-numeric font-normal text-muted-foreground">of {total} left</span>
      </div>
      <span className="flex h-2 overflow-hidden rounded-full bg-card" aria-hidden>
        <span className={cn("h-full", low ? "bg-destructive" : "bg-primary")} style={{ width: `${fill}%` }} />
      </span>
      <p className="type-body-sm text-muted-foreground">
        {remaining === 0
          ? "No previews left. Buy more to start the next customer."
          : "One credit is one preview. Tries again on the same customer are free."}
      </p>
    </div>
  );

  const buyButton = (
    <div className="flex flex-col gap-2">
      <Button
        size="cta"
        onClick={() => {
          buy();
          setJustBought(true);
        }}
      >
        Buy 100 more · £10
      </Button>
      <p role="status" className="type-body-sm text-center text-muted-foreground empty:hidden">
        {justBought ? "100 credits added." : ""}
      </p>
    </div>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setJustBought(false);
      }}
    >
      <DrawerContent className="mx-auto max-h-[85dvh] max-w-[430px]">
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-4 pt-2 pb-[calc(32px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <DrawerTitle className="type-title">Credits</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" className="h-11 px-1 text-base font-semibold">
                Done
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">
            Credits left, buy more credits, and recent previews.
          </DrawerDescription>

          {/* At 10 or fewer, the buy option comes first. */}
          {low ? (
            <>
              {buyButton}
              {balance}
            </>
          ) : (
            <>
              {balance}
              {buyButton}
            </>
          )}

          <h2 className="type-label mt-1 text-muted-foreground">Recent previews</h2>
          <div className="flex flex-col border-t border-border">
            {fakeHistory.slice(0, 20).map((s) => (
              <HistoryItem
                key={s.id}
                href={`/s/${s.id}/result`}
                name={s.name}
                thumbnail={s.thumbnail}
                createdAt={s.createdAt}
                status={s.status}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
