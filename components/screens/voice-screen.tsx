"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecordButton } from "@/components/record-button";
import { Screen } from "@/components/screen";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { type Recording, type RecorderError, useRecorder } from "@/lib/client/use-recorder";
import { triesLeftLabel } from "@/lib/tries";

const FIRST_TIME = {
  title: "Tell us what you want",
  intro: "Talk like you would to your barber. Mention the sides, the top, the back and anything to avoid.",
  examples: ["“Short on the sides”", "“Keep length on top”", "“Don’t touch the beard”"],
  placeholder: "Skin fade on the sides, keep length on top…",
  cta: "Create preview",
};

const ADJUSTING = {
  title: "What should we change?",
  intro: "Say what to adjust from the last preview. Everything else stays the same.",
  examples: ["“A bit shorter on top”", "“Softer fade”", "“Square the neckline”"],
  placeholder: "A bit shorter on top…",
  cta: "Create new preview",
};

const MIC_ERROR: Record<RecorderError, string> = {
  denied: "We can’t use the microphone. Type what you want instead.",
  unsupported: "This browser can’t record audio. Type what you want instead.",
  failed: "The recording didn’t work. Try again or type it.",
};

type Heard = { voiceNoteId: number; transcript: string };

export function VoiceScreen({
  sessionId,
  adjusting,
  triesLeft,
}: {
  sessionId: string;
  adjusting: boolean;
  triesLeft: number;
}) {
  const router = useRouter();
  const copy = adjusting ? ADJUSTING : FIRST_TIME;

  const [heard, setHeard] = useState<Heard | null>(null);
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function upload({ blob, mime, seconds }: Recording) {
    setListening(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/voice?duration=${seconds.toFixed(1)}`, {
        method: "POST",
        headers: { "Content-Type": mime },
        body: blob,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHeard(data as Heard);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "We couldn’t hear that. Record again or type it.");
    } finally {
      setListening(false);
    }
  }

  const recorder = useRecorder(upload);
  const micError = recorder.error ? MIC_ERROR[recorder.error] : null;
  const showTyping = typing || recorder.error === "denied" || recorder.error === "unsupported";

  function record() {
    setHeard(null);
    setError(null);
    recorder.start();
  }

  async function createPreview() {
    setSubmitting(true);
    setError(null);
    const body = showTyping ? { text: typed.trim() } : { voiceNoteId: heard?.voiceNoteId };
    const res = await fetch(`/api/sessions/${sessionId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push(`/s/${sessionId}/processing`);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Something went wrong. Try again.");
    setSubmitting(false);
  }

  const ready = !submitting && !recorder.recording && !listening && (showTyping ? typed.trim().length > 2 : Boolean(heard));

  return (
    <Screen className="gap-6">
      <TopBar backHref={adjusting ? `/s/${sessionId}/result` : `/s/${sessionId}/photos`} step="Step 2 of 3" />

      <div className="flex flex-col gap-2">
        <h1 className="type-title">{copy.title}</h1>
        <p className="type-body-sm text-muted-foreground">{copy.intro}</p>
        {adjusting && <p className="type-label text-muted-foreground">{triesLeftLabel(triesLeft)}</p>}
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="For example">
        {copy.examples.map((e) => (
          <li key={e} className="type-body-sm rounded-sm bg-secondary px-3 py-1.5">
            {e}
          </li>
        ))}
      </ul>

      {showTyping ? (
        <div className="flex flex-col gap-2">
          {micError && !typing && <p className="type-body-sm text-foreground">{micError}</p>}
          <label htmlFor="typed-request" className="type-label text-muted-foreground">
            Or type it
          </label>
          <textarea
            id="typed-request"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={copy.placeholder}
            className="type-body min-h-28 w-full resize-none rounded-md bg-card p-3 shadow-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
          />
          {typing && (
            <Button variant="ghost" className="h-11 self-center text-base" onClick={() => setTyping(false)}>
              Record instead
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 py-4">
            {listening ? (
              <p className="type-body-sm py-10 text-muted-foreground" role="status">
                Listening back…
              </p>
            ) : (
              <RecordButton
                recording={recorder.recording}
                elapsed={recorder.elapsed}
                onStart={record}
                onStop={recorder.stop}
              />
            )}
            {!heard && !recorder.recording && !listening && (
              <Button variant="ghost" className="mt-2 h-11 text-base" onClick={() => setTyping(true)}>
                Or type it
              </Button>
            )}
          </div>

          {heard && !recorder.recording && !listening && (
            <div className="flex flex-col gap-2 rounded-lg bg-card p-4 shadow-sm">
              <span className="type-label text-muted-foreground">What we heard</span>
              <p className="type-body">{heard.transcript}</p>
            </div>
          )}
        </>
      )}

      {(error || (micError && !showTyping)) && (
        <p role="alert" className="type-body-sm text-destructive">
          {error ?? micError}
        </p>
      )}

      <div className="grow" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="cta"
          variant="secondary"
          disabled={!heard || recorder.recording || listening || submitting || showTyping}
          onClick={record}
        >
          Record again
        </Button>
        <Button size="cta" disabled={!ready} onClick={createPreview}>
          {submitting ? "Starting…" : copy.cta}
        </Button>
      </div>
    </Screen>
  );
}
