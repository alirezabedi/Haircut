"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/before-after";
import { CaptureSlot, type CaptureState } from "@/components/capture-slot";
import { CreditCounter } from "@/components/credit-counter";
import { HistoryItem } from "@/components/history-item";
import { RecordButton } from "@/components/record-button";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { type Angle, fakeHistory, fakePhotos, fakePreview } from "@/lib/fake-data";
import { useFakeRecorder } from "@/lib/use-fake-recorder";

const ANGLES: { angle: Angle; label: string }[] = [
  { angle: "front", label: "Front" },
  { angle: "left", label: "Left side" },
  { angle: "right", label: "Right side" },
  { angle: "back", label: "Back" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-label text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function ComponentGallery() {
  const [taken, setTaken] = useState<Angle[]>([]);
  const recorder = useFakeRecorder();

  const active = ANGLES.find((a) => !taken.includes(a.angle))?.angle;
  const slotState = (a: Angle): CaptureState =>
    taken.includes(a) ? "done" : a === active ? "active" : "empty";

  return (
    <Screen className="gap-8">
      <TopBar step="Components (dev)" />

      <Section title="Button">
        <div className="grid grid-cols-2 gap-3">
          <Button size="cta">Approve this cut</Button>
          <Button size="cta" variant="secondary">Try again</Button>
          <Button size="cta" variant="ghost">Retake photos</Button>
          <Button size="cta" disabled>Generating…</Button>
        </div>
      </Section>

      <Section title={`CaptureSlot · ${taken.length}/4`}>
        <div className="grid grid-cols-2 gap-3">
          {ANGLES.map(({ angle, label }) => (
            <CaptureSlot
              key={angle}
              angle={angle}
              label={label}
              state={slotState(angle)}
              imageSrc={fakePhotos[angle]}
              onTap={() => setTaken((t) => (t.includes(angle) ? t : [...t, angle]))}
            />
          ))}
        </div>
        <Button variant="ghost" className="self-start" onClick={() => setTaken([])}>
          Reset slots
        </Button>
      </Section>

      <Section title="RecordButton">
        <RecordButton
          recording={recorder.recording}
          elapsed={recorder.elapsed}
          onStart={recorder.start}
          onStop={recorder.stop}
        />
      </Section>

      <Section title="BeforeAfter">
        <BeforeAfter beforeSrc={fakePhotos.front} afterSrc={fakePreview} />
      </Section>

      <Section title="CreditCounter">
        <div className="flex gap-4">
          <CreditCounter remaining={73} onOpen={() => {}} />
          <CreditCounter remaining={6} onOpen={() => {}} />
        </div>
      </Section>

      <Section title="HistoryItem">
        <div className="flex flex-col border-t border-border">
          {fakeHistory.slice(0, 2).map((s) => (
            <HistoryItem key={s.id} href={`/s/${s.id}/result`} {...s} />
          ))}
        </div>
      </Section>
    </Screen>
  );
}
