"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { CaptureSlot, type CaptureState } from "@/components/capture-slot";
import { useDemoSession } from "@/components/demo-session-provider";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { type Angle, fakePhotos } from "@/lib/fake-data";

const SLOTS: { angle: Angle; label: string }[] = [
  { angle: "front", label: "Front" },
  { angle: "left", label: "Left side" },
  { angle: "right", label: "Right side" },
  { angle: "back", label: "Back" },
];

export function PhotosScreen({ sessionId }: { sessionId: string }) {
  const { photos, takePhoto } = useDemoSession();
  const next = SLOTS.find((s) => !photos.includes(s.angle));
  const count = photos.length;

  // M1: "taking" a photo fills the slot with a sample image. The camera arrives in M2.
  const state = (angle: Angle): CaptureState =>
    photos.includes(angle) ? "done" : angle === next?.angle ? "active" : "empty";

  return (
    <Screen className="gap-6">
      <TopBar backHref="/" step="Step 1 of 3" />

      <div className="flex flex-col gap-2">
        <h1 className="type-title">Front, sides and back</h1>
        <p className="type-body-sm text-muted-foreground">
          Sit up straight with the phone at eye level. Good light, no hat or glasses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SLOTS.map(({ angle, label }) => (
          <CaptureSlot
            key={angle}
            angle={angle}
            label={label}
            state={state(angle)}
            imageSrc={fakePhotos[angle]}
            onTap={() => takePhoto(angle)}
          />
        ))}
      </div>

      <div className="grow" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-1.5 grow overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Photos taken"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={count}
          >
            <span className="h-full bg-primary transition-[width]" style={{ width: `${(count / 4) * 100}%` }} />
          </span>
          <span className="type-numeric text-muted-foreground" aria-hidden>
            {count}/4
          </span>
        </div>

        {next ? (
          <Button size="cta" onClick={() => takePhoto(next.angle)}>
            <Camera strokeWidth={1.5} aria-hidden />
            Take {next.label.toLowerCase()} photo
          </Button>
        ) : (
          <Button size="cta" asChild>
            <Link href={`/s/${sessionId}/voice`}>Next: voice note</Link>
          </Button>
        )}
      </div>
    </Screen>
  );
}
