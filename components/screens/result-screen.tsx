"use client";

import Link from "next/link";
import { ImageOff, TriangleAlert } from "lucide-react";
import { useTransition } from "react";
import { approveSession } from "@/app/(shop)/actions";
import { BeforeAfter } from "@/components/before-after";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { formatWhen } from "@/lib/format";
import { splitGuardNumbers } from "@/lib/guard-numbers";
import { triesLeftLabel } from "@/lib/tries";
import type { HaircutSpec, SessionStatus } from "@/lib/types";
import { useNow } from "@/lib/use-now";

type Props = {
  sessionId: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  spec: HaircutSpec;
  triesLeft: number;
  readOnly: boolean;
  meta: { createdAt: number; status: SessionStatus } | null;
};

export function ResultScreen({ sessionId, beforeUrl, afterUrl, spec, triesLeft, readOnly, meta }: Props) {
  const now = useNow();
  const [approving, startApprove] = useTransition();

  return (
    <Screen className="gap-4">
      {meta ? (
        <TopBar
          backHref="/"
          step={`${formatWhen(new Date(meta.createdAt), now)} · ${meta.status === "approved" ? "Approved" : "Not approved"}`}
        />
      ) : (
        <TopBar step="Step 3 of 3" />
      )}

      <h1 className="type-title">{readOnly ? "Past preview" : "Your preview"}</h1>

      {beforeUrl && afterUrl ? (
        <BeforeAfter beforeSrc={beforeUrl} afterSrc={afterUrl} className="aspect-auto h-[330px]" />
      ) : (
        <div className="flex h-[330px] flex-col items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground">
          <ImageOff className="size-6" strokeWidth={1.5} aria-hidden />
          <p className="type-body-sm">Photos are deleted after 7 days.</p>
        </div>
      )}

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

      {!readOnly && (
        <div className="grid grid-cols-2 gap-3">
          {triesLeft > 0 ? (
            <Button size="cta" variant="secondary" asChild>
              <Link href={`/s/${sessionId}/voice`} className="flex-col gap-0 leading-5">
                Try again
                <span className="text-xs leading-4 font-normal text-muted-foreground">{triesLeftLabel(triesLeft)}</span>
              </Link>
            </Button>
          ) : (
            <Button size="cta" variant="secondary" disabled className="flex-col gap-0 leading-5">
              Try again
              <span className="text-xs leading-4 font-normal text-muted-foreground">{triesLeftLabel(0)}</span>
            </Button>
          )}
          <Button size="cta" disabled={approving} onClick={() => startApprove(() => approveSession(sessionId))}>
            {approving ? "Approving…" : "Approve this cut"}
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
