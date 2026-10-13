"use client";

import { useEffect, useRef, useState } from "react";

export const MAX_RECORDING_SECONDS = 90;

// Chrome/Android records webm/opus; iOS Safari records mp4/aac. Both are accepted by OpenAI.
const PREFERRED = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"];

export function pickMimeType(isSupported: (t: string) => boolean): string | undefined {
  return PREFERRED.find((t) => isSupported(t));
}

export type Recording = { blob: Blob; mime: string; seconds: number };
export type RecorderError = "denied" | "unsupported" | "failed";

/** Microphone recording with MediaRecorder, auto-stopping at 90 s. */
export function useRecorder(onDone: (r: Recording) => void) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const startedAt = useRef(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function start() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError(e instanceof DOMException && e.name === "NotAllowedError" ? "denied" : "failed");
      return;
    }

    const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      const mime = rec.mimeType || mimeType || "audio/webm";
      const seconds = Math.min(MAX_RECORDING_SECONDS, (Date.now() - startedAt.current) / 1000);
      if (chunks.length) onDoneRef.current({ blob: new Blob(chunks, { type: mime }), mime, seconds });
      else setError("failed");
    };
    recorder.current = rec;
    startedAt.current = Date.now();
    setElapsed(0);
    rec.start(1000);
    setRecording(true);
  }

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(Math.min(secs, MAX_RECORDING_SECONDS));
      if (secs >= MAX_RECORDING_SECONDS) stop();
    }, 250);
    return () => clearInterval(id);
  }, [recording]);

  // Release the microphone if the screen unmounts mid-recording.
  useEffect(() => () => stop(), []);

  return { recording, elapsed, error, start, stop };
}
