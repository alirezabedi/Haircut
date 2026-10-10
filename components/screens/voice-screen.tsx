"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoSession } from "@/components/demo-session-provider";
import { RecordButton } from "@/components/record-button";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { fakeAdjustmentTranscript, fakeTranscript } from "@/lib/fake-data";
import { triesLeft, triesLeftLabel } from "@/lib/tries";
import { useFakeRecorder } from "@/lib/use-fake-recorder";

const FIRST_TIME = {
  title: "Tell us what you want",
  intro: "Talk like you would to your barber. Mention the sides, the top, the back and anything to avoid.",
  examples: ["“Short on the sides”", "“Keep length on top”", "“Don’t touch the beard”"],
  cta: "Create preview",
};

const ADJUSTING = {
  title: "What should we change?",
  intro: "Say what to adjust from the last preview. Everything else stays the same.",
  examples: ["“A bit shorter on top”", "“Softer fade”", "“Square the neckline”"],
  cta: "Create new preview",
};

export function VoiceScreen({ sessionId }: { sessionId: string }) {
  const { generations } = useDemoSession();
  const adjusting = generations > 0;
  const copy = adjusting ? ADJUSTING : FIRST_TIME;

  const [heard, setHeard] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  // M1: stopping shows a fake transcript. Real recording and transcription arrive in M2/M3.
  const recorder = useFakeRecorder(() => setHeard(adjusting ? fakeAdjustmentTranscript : fakeTranscript));

  const request = typing ? typed.trim() : heard;
  const ready = Boolean(request) && !recorder.recording;

  return (
    <Screen className="gap-6">
      <TopBar backHref={adjusting ? `/s/${sessionId}/result` : `/s/${sessionId}/photos`} step="Step 2 of 3" />

      <div className="flex flex-col gap-2">
        <h1 className="type-title">{copy.title}</h1>
        <p className="type-body-sm text-muted-foreground">{copy.intro}</p>
        {adjusting && (
          <p className="type-label text-muted-foreground">{triesLeftLabel(triesLeft(generations))}</p>
        )}
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="For example">
        {copy.examples.map((e) => (
          <li key={e} className="type-body-sm rounded-sm bg-secondary px-3 py-1.5">
            {e}
          </li>
        ))}
      </ul>

      {typing ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="typed-request" className="type-label text-muted-foreground">
            Or type it
          </label>
          <textarea
            id="typed-request"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            rows={4}
            placeholder={adjusting ? "A bit shorter on top…" : "Skin fade on the sides, keep length on top…"}
            className="type-body min-h-28 w-full resize-none rounded-md bg-card p-3 shadow-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
          />
          <Button variant="ghost" className="h-11 self-center text-base" onClick={() => setTyping(false)}>
            Record instead
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 py-4">
            <RecordButton
              recording={recorder.recording}
              elapsed={recorder.elapsed}
              onStart={() => {
                setHeard(null);
                recorder.start();
              }}
              onStop={recorder.stop}
            />
            {!heard && !recorder.recording && (
              <Button variant="ghost" className="mt-2 h-11 text-base" onClick={() => setTyping(true)}>
                Or type it
              </Button>
            )}
          </div>

          {heard && !recorder.recording && (
            <div className="flex flex-col gap-2 rounded-lg bg-card p-4 shadow-sm">
              <span className="type-label text-muted-foreground">What we heard</span>
              <p className="type-body">{heard}</p>
            </div>
          )}
        </>
      )}

      <div className="grow" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="cta"
          variant="secondary"
          disabled={!heard || recorder.recording || typing}
          onClick={() => {
            setHeard(null);
            recorder.start();
          }}
        >
          Record again
        </Button>
        {ready ? (
          <Button size="cta" asChild>
            <Link href={`/s/${sessionId}/processing`}>{copy.cta}</Link>
          </Button>
        ) : (
          <Button size="cta" disabled>
            {copy.cta}
          </Button>
        )}
      </div>
    </Screen>
  );
}
