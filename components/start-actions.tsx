"use client";

import { useActionState, useEffect, useState } from "react";
import { startSession, type StartState } from "@/app/(shop)/actions";
import { useCredits } from "@/components/credits/credits-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/** Consent checkbox + Start. Start needs consent and at least one credit. */
export function StartActions() {
  const { remaining, setOpen } = useCredits();
  const [consent, setConsent] = useState(false);
  const [state, action, pending] = useActionState<StartState, FormData>(startSession, null);
  const noCredits = remaining <= 0;

  // With 0 credits, the sheet opens with the buy button (docs/SPEC.md §4).
  useEffect(() => {
    if (noCredits) setOpen(true);
  }, [noCredits, setOpen]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="type-body-sm flex min-h-11 cursor-pointer items-start gap-3 text-muted-foreground">
        <Checkbox
          name="consent"
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
        />
        <span>
          I agree my photos and voice note are used to make this preview. They are deleted after 7
          days.
        </span>
      </label>

      {noCredits && (
        <p className="type-body-sm text-foreground">
          No previews left. Tap the counter at the top to buy more.
        </p>
      )}
      {state && (
        <p role="alert" className="type-body-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button size="cta" type="submit" disabled={!consent || noCredits || pending}>
        {pending ? "Starting…" : "Start"}
      </Button>
    </form>
  );
}
