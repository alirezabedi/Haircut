"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useDemoSession } from "@/components/demo-session-provider";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { readDevState } from "@/lib/dev-state";
import { cn } from "@/lib/utils";

// M1: steps tick through on a timer. In M3 this polls the generation status every 2 s.
const STEP_MS = [1600, 1800, 2600];
const BAR = [12, 42, 72, 100];

type Run = { done: number; failed: boolean };

export function ProcessingScreen({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { generations, completeGeneration } = useDemoSession();
  const [run, setRun] = useState<Run>({ done: 0, failed: false });
  const [attempt, setAttempt] = useState(0);
  const finished = useRef(false);

  const steps = [
    generations > 0 ? "Listened to your changes" : "Listened to your note",
    "Checked your four photos",
    "Drawing the preview",
  ];

  useEffect(() => {
    // Dev-only ?state=error fails the last step on the first run; "Try again" then succeeds.
    const failLast = attempt === 0 && readDevState(window.location.search) === "error";
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    STEP_MS.forEach((ms, i) => {
      t += ms;
      timers.push(
        setTimeout(() => {
          if (failLast && i === STEP_MS.length - 1) setRun({ done: i, failed: true });
          else setRun({ done: i + 1, failed: false });
        }, t),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [attempt]);

  const allDone = run.done === steps.length;

  const recordGeneration = useEffectEvent(() => {
    // Guard against the effect running twice (React dev mode) charging twice.
    if (finished.current) return;
    finished.current = true;
    completeGeneration();
  });

  useEffect(() => {
    if (!allDone) return;
    recordGeneration();
    const id = setTimeout(() => router.replace(`/s/${sessionId}/result`), 500);
    return () => clearTimeout(id);
  }, [allDone, router, sessionId]);

  return (
    <Screen>
      <TopBar />

      <div className="flex grow flex-col justify-center gap-8 py-8">
        <div className="flex flex-col gap-3" aria-live="polite">
          <h1 className="type-display">{run.failed ? "Something went wrong" : "Shaping your cut"}</h1>
          <p className="type-body text-muted-foreground">
            {run.failed
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
          aria-valuenow={BAR[run.done]}
        >
          <span
            className={cn("h-full transition-[width] duration-700 ease-out", run.failed ? "bg-destructive" : "bg-primary")}
            style={{ width: `${BAR[run.done]}%` }}
          />
        </span>

        <ul className="type-body flex flex-col gap-4">
          {steps.map((label, i) => {
            const state =
              i < run.done ? "done" : i === run.done ? (run.failed ? "failed" : "current") : "pending";
            return (
              <li key={label} className="flex items-center gap-3">
                <StepIcon state={state} />
                <span
                  className={cn(
                    state === "current" && "font-semibold",
                    state === "pending" && "text-muted-foreground",
                    state === "failed" && "font-semibold",
                  )}
                >
                  {state === "failed" ? "Couldn’t draw the preview" : label}
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
        {run.failed ? (
          <Button
            size="cta"
            onClick={() => {
              setRun({ done: 0, failed: false });
              setAttempt((a) => a + 1);
            }}
          >
            Try again
          </Button>
        ) : allDone ? (
          <Button size="cta" variant="ghost" asChild>
            <Link href={`/s/${sessionId}/result`} replace>
              View preview
            </Link>
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
