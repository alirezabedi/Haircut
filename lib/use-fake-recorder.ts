"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_RECORDING_SECONDS } from "@/components/record-button";

/** M1 stand-in for MediaRecorder: a running timer that auto-stops at 90 s. */
export function useFakeRecorder(onStop?: () => void) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const onStopRef = useRef(onStop);
  useEffect(() => {
    onStopRef.current = onStop;
  });

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      if (secs >= MAX_RECORDING_SECONDS) {
        clearInterval(id);
        setElapsed(MAX_RECORDING_SECONDS);
        setRecording(false);
        onStopRef.current?.();
      } else {
        setElapsed(secs);
      }
    }, 250);
    return () => clearInterval(id);
  }, [recording]);

  return {
    recording,
    elapsed,
    start: () => {
      startedAt.current = Date.now();
      setElapsed(0);
      setRecording(true);
    },
    stop: () => {
      setRecording(false);
      onStopRef.current?.();
    },
  };
}
