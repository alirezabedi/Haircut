"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { BeforeAfter } from "@/components/before-after";
import { useDemoSession } from "@/components/demo-session-provider";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { useDevState } from "@/lib/dev-state";
import {
  fakeFeasibilityWarning,
  fakePhotos,
  fakePreview,
  fakeSpec,
  type HaircutSpec,
  type HistoryEntry,
} from "@/lib/fake-data";
import { formatWhen } from "@/lib/format";
import { splitGuardNumbers } from "@/lib/guard-numbers";
import { triesLeft, triesLeftLabel } from "@/lib/tries";
import { useNow } from "@/lib/use-now";

type Props = {
  sessionId: string;
  /** Set when opened from the credits sheet: read-only, no actions. */
  past?: HistoryEntry;
};

export function ResultScreen({ sessionId, past }: Props) {
  const router = useRouter();
  const { generations, reset } = useDemoSession();
  const devState = useDevState();
  const now = useNow();

  const spec: HaircutSpec = past
    ? { ...fakeSpec, name: past.name }
    : { ...fakeSpec, feasibility_warning: devState === "warning" ? fakeFeasibilityWarning : "" };
  const left = triesLeft(generations);

  return (
    <Screen className="gap-4">
      {past ? (
        <TopBar backHref="/" step={`${formatWhen(past.createdAt, now)} · ${past.status === "approved" ? "Approved" : "Not approved"}`} />
      ) : (
        <TopBar step="Step 3 of 3" />
      )}

      <h1 className="type-title">{past ? "Past preview" : "Your preview"}</h1>

      <BeforeAfter
        beforeSrc={fakePhotos.front}
        afterSrc={past?.thumbnail ?? fakePreview}
        className="aspect-auto h-[330px]"
      />

      {spec.feasibility_warning && (
        <div role="note" className="flex gap-3 rounded-lg bg-secondary p-4">
          <TriangleAlert className="mt-0.5 size-5 flex-none" strokeWidth={1.5} aria-hidden />
          <div className="flex flex-col gap-1">
            <span className="type-body font-semibold">Not quite possible today</span>
            <p className="type-body-sm">{spec.feasibility_warning}</p>
          </div>
        </div>
      )}

      <SpecCard spec={spec} />

      <div className="grow" />

      {!past && (
        <div className="grid grid-cols-2 gap-3">
          {left > 0 ? (
            <Button size="cta" variant="secondary" asChild>
              <Link href={`/s/${sessionId}/voice`} className="flex-col gap-0 leading-5">
                Try again
                <span className="text-xs leading-4 font-normal text-muted-foreground">{triesLeftLabel(left)}</span>
              </Link>
            </Button>
          ) : (
            <Button size="cta" variant="secondary" disabled className="flex-col gap-0 leading-5">
              Try again
              <span className="text-xs leading-4 font-normal text-muted-foreground">{triesLeftLabel(0)}</span>
            </Button>
          )}
          <Button
            size="cta"
            onClick={() => {
              // M1: approving just starts over. M2 marks the session approved.
              reset();
              router.push("/");
            }}
          >
            Approve this cut
          </Button>
        </div>
      )}
    </Screen>
  );
}

const ROWS: { key: keyof HaircutSpec; label: string }[] = [
  { key: "sides", label: "Sides" },
  { key: "top", label: "Top" },
  { key: "back", label: "Back" },
  { key: "neckline", label: "Neckline" },
  { key: "beard", label: "Beard" },
  { key: "notes", label: "Notes" },
];

function SpecCard({ spec }: { spec: HaircutSpec }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-sm">
      <h2 className="type-heading">{spec.name}</h2>
      <dl className="type-body-sm grid grid-cols-[96px_minmax(0,1fr)] gap-y-2">
        {ROWS.filter((r) => spec[r.key]).map(({ key, label }) => (
          <div key={key} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>
              {splitGuardNumbers(spec[key]).map((part, i) =>
                part.guard ? (
                  <span key={i} className="font-mono">
                    {part.text}
                  </span>
                ) : (
                  part.text
                ),
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
