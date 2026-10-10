import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export const MAX_RECORDING_SECONDS = 90;

type Props = {
  recording: boolean;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
};

/**
 * Voice-note control: red dot when idle, rounded square and timer while recording.
 * Sized as on docs/design/screens/3-voice.html (96px disc).
 */
export function RecordButton({ recording, elapsed, onStart, onStop }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recording ? onStop : onStart}
        aria-label={recording ? "Stop recording" : "Record"}
        className={cn(
          "flex size-24 items-center justify-center rounded-full border-2 bg-card shadow-md",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
          recording ? "border-destructive" : "border-border",
        )}
      >
        <span
          className={cn(
            "bg-destructive transition-all duration-150",
            recording ? "size-7 rounded-[6px]" : "size-8 rounded-full",
          )}
          aria-hidden
        />
      </button>
      {recording ? (
        <>
          <span className="font-mono text-xl font-medium" role="timer">
            {formatDuration(elapsed)}
          </span>
          <span className="type-body-sm text-muted-foreground">Recording. Tap to stop.</span>
        </>
      ) : (
        <span className="type-body-sm text-muted-foreground">
          Tap to record. Up to {MAX_RECORDING_SECONDS} seconds.
        </span>
      )}
    </div>
  );
}
