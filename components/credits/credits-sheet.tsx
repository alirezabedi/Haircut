"use client";

import { useState } from "react";
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
import { isLow, meterFill } from "@/lib/credits-meter";
import { cn } from "@/lib/utils";

/** Bottom sheet: credits left, "Buy 100 more", and the last 20 sessions. */
export function CreditsSheet() {
  const { remaining, history, open, setOpen, buy } = useCredits();
  const [purchase, setPurchase] = useState<"idle" | "buying" | "done" | "failed">("idle");
  const low = isLow(remaining);

  const balance = (
    <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-4xl leading-10 font-medium">{remaining}</span>
        <span className="type-numeric font-normal text-muted-foreground">
          {remaining === 1 ? "credit" : "credits"} left
        </span>
      </div>
      <span className="flex h-2 overflow-hidden rounded-full bg-card" aria-hidden>
        <span className={cn("h-full", low ? "bg-destructive" : "bg-primary")} style={{ width: `${meterFill(remaining)}%` }} />
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
        disabled={purchase === "buying"}
        onClick={async () => {
          setPurchase("buying");
          setPurchase((await buy()) ? "done" : "failed");
        }}
      >
        {purchase === "buying" ? "Adding credits…" : "Buy 100 more · £10"}
      </Button>
      <p
        role="status"
        className={cn("type-body-sm text-center empty:hidden", purchase === "failed" ? "text-destructive" : "text-muted-foreground")}
      >
        {purchase === "done" ? "100 credits added." : purchase === "failed" ? "That didn’t go through. Try again." : ""}
      </p>
    </div>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPurchase("idle");
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
          {history.length === 0 ? (
            <p className="type-body-sm text-muted-foreground">
              Previews appear here once your first customer has one.
            </p>
          ) : (
            <div className="flex flex-col border-t border-border">
              {history.map((s) => (
                <HistoryItem
                  key={s.sessionId}
                  href={`/s/${s.sessionId}/result?from=history`}
                  name={s.name}
                  thumbnail={s.thumbnail}
                  createdAt={new Date(s.createdAt)}
                  status={s.status}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
