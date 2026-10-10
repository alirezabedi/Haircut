"use client";

import Link from "next/link";
import { useState } from "react";
import { useCredits } from "@/components/credits/credits-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DEMO_SESSION_ID } from "@/lib/fake-data";

/** Consent checkbox + Start. Start needs consent and at least one credit. */
export function StartActions() {
  const { remaining } = useCredits();
  const [consent, setConsent] = useState(false);
  const noCredits = remaining <= 0;
  const canStart = consent && !noCredits;

  return (
    <div className="flex flex-col gap-4">
      <label className="type-body-sm flex min-h-11 cursor-pointer items-start gap-3 text-muted-foreground">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0"
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

      {canStart ? (
        <Button size="cta" asChild>
          <Link href={`/s/${DEMO_SESSION_ID}/photos`}>Start</Link>
        </Button>
      ) : (
        <Button size="cta" disabled>
          Start
        </Button>
      )}
    </div>
  );
}
