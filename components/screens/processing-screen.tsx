"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import type { GenerationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_MS = 2000;

// Which checklist step each pipeline status is on (0 = note, 1 = photos/spec, 2 = drawing).
const STEP: Record<GenerationStatus, number> = {
  queued: 0,
  transcribing: 0,
  spec: 1,
  imaging: 2,
  done: 3,
  failed: -1,
};
const BAR = [12, 42, 72, 100];

export function ProcessingScreen({
  sessionId,
  initialStatus,
  adjusting,
}: {
  sessionId: string;
  initialStatus: GenerationStatus;
  adjusting: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus>(initialStatus);
  const [failedAt, setFailedAt] = useState(2);
  const lastStep = useRef(STEP[initialStatus]);
  const [retrying, setRetrying] = useState(false);
  const failed = status === "failed";

  useEffect(() => {
    if (status === "done" || status === "failed") return;
    let stop = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/status`, { cache: "no-store" });
        if (!res.ok || stop) return;
        const data = (await res.json()) as { status: GenerationStatus | null };
        if (!data.status || stop) return;
        if (data.status === "failed") setFailedAt(Math.max(0, lastStep.current));
        else lastStep.current = STEP[data.status];
        setStatus(data.status);
      } catch {
        // Network blip on shop Wi-Fi: keep polling.
      }
    }, POLL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [sessionId, status]);

  useEffect(() => {
    if (status !== "done") return;
    // Refresh so the credit counter shows the charge, then show the result.
    router.replace(`/s/${sessionId}/result`);
    router.refresh();
  }, [status, router, sessionId]);

  async function retry() {
    setRetrying(true);
    const res = await fetch(`/api/sessions/${sessionId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retry: true }),
    });
    setRetrying(false);
    if (res.ok) {
      lastStep.current = 0;
      setStatus("queued");
    }
    else router.push(`/s/${sessionId}/voice`);
  }

  const steps = [
    adjusting ? "Listened to your changes" : "Listened to your note",
    "Checked your four photos",
    "Drawing the preview",
  ];
  const current = failed ? failedAt : STEP[status];

  return (
    <Screen>
      <TopBar />

      <div className="flex grow flex-col justify-center gap-8 py-8">
        <div className="flex flex-col gap-3" aria-live="polite">
          <h1 className="type-display">{failed ? "Something went wrong" : "Shaping your cut"}</h1>
          <p className="type-body text-muted-foreground">
            {failed
              ? "Try again. It won’t use a credit or one of your tries."
              : "About 30 seconds. Keep the phone here."}
          </p>
        </div>

        <span
          className="flex h-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Preview progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={BAR[Math.max(0, current)]}
        >
          <span
            className={cn("h-full transition-[width] duration-700 ease-out", failed ? "bg-destructive" : "bg-primary")}
            style={{ width: `${BAR[Math.max(0, current)]}%` }}
          />
        </span>

        <ul className="type-body flex flex-col gap-4">
          {steps.map((label, i) => {
            const state = i < current ? "done" : i === current ? (failed ? "failed" : "current") : "pending";
            return (
              <li key={label} className="flex items-center gap-3">
                <StepIcon state={state} />
                <span
                  className={cn(
                    (state === "current" || state === "failed") && "font-semibold",
                    state === "pending" && "text-muted-foreground",
                  )}
                >
                  {state === "failed" ? "That step didn’t work" : label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <p className="type-body-sm text-muted-foreground">
          The preview is a guide. Your barber will confirm what works with your hair.
        </p>
        {failed ? (
          <Button size="cta" onClick={retry} disabled={retrying}>
            {retrying ? "Starting…" : "Try again"}
          </Button>
        ) : (
          <Button size="cta" variant="ghost" disabled>
            View preview
          </Button>
        )}
      </div>
    </Screen>
  );
}

function StepIcon({ state }: { state: "done" | "current" | "pending" | "failed" }) {
  if (state === "done")
    return (
      <span className="flex size-6 flex-none items-center justify-center rounded-full bg-primary text-on-primary">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    );
  if (state === "failed")
    return (
      <span className="flex size-6 flex-none items-center justify-center rounded-full bg-destructive text-on-destructive">
        <X className="size-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    );
  return (
    <span
      className={cn(
        "flex size-6 flex-none items-center justify-center rounded-full border-2",
        state === "current" ? "border-primary-ink" : "border-muted-foreground/40",
      )}
    >
      {state === "current" && <span className="size-2 animate-pulse rounded-full bg-primary-ink" />}
    </span>
  );
}
