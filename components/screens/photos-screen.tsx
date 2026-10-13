"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { CaptureSlot, type CaptureState } from "@/components/capture-slot";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { resizePhoto } from "@/lib/client/resize-photo";
import { ANGLE_LABEL, ANGLES, type Angle } from "@/lib/types";

type Props = { sessionId: string; initialPhotos: Partial<Record<Angle, string>> };

export function PhotosScreen({ sessionId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState<Angle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<Angle>("front");

  const next = ANGLES.find((a) => !photos[a]);
  const count = ANGLES.filter((a) => photos[a]).length;

  function openCamera(angle: Angle) {
    if (uploading) return;
    target.current = angle;
    setError(null);
    input.current?.click();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const angle = target.current;
    setUploading(angle);
    try {
      const jpeg = await resizePhoto(file);
      const res = await fetch(`/api/sessions/${sessionId}/photos/${angle}`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: jpeg,
      });
      if (!res.ok) throw new Error(String(res.status));
      const { url } = (await res.json()) as { url: string };
      setPhotos((p) => ({ ...p, [angle]: url }));
    } catch {
      setError(`Couldn’t save the ${ANGLE_LABEL[angle].toLowerCase()} photo. Tap the slot to try again.`);
    } finally {
      setUploading(null);
      if (input.current) input.current.value = "";
    }
  }

  const state = (angle: Angle): CaptureState =>
    photos[angle] ? "done" : angle === next ? "active" : "empty";

  return (
    <Screen className="gap-6">
      <TopBar backHref="/" step="Step 1 of 3" />

      <div className="flex flex-col gap-2">
        <h1 className="type-title">Front, sides and back</h1>
        <p className="type-body-sm text-muted-foreground">
          Sit up straight with the phone at eye level. Good light, no hat or glasses.
        </p>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div className="grid grid-cols-2 gap-3">
        {ANGLES.map((angle) => (
          <CaptureSlot
            key={angle}
            angle={angle}
            label={ANGLE_LABEL[angle]}
            state={state(angle)}
            imageSrc={photos[angle]}
            busy={uploading === angle}
            onTap={() => openCamera(angle)}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="type-body-sm text-destructive">
          {error}
        </p>
      )}

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
          <Button size="cta" disabled={uploading !== null} onClick={() => openCamera(next)}>
            <Camera strokeWidth={1.5} aria-hidden />
            {uploading ? "Saving photo…" : `Take ${ANGLE_LABEL[next].toLowerCase()} photo`}
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
