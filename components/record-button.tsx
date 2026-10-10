import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export const MAX_RECORDING_SECONDS = 90;

type Props = {
  recording: boolean;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
};

/** Voice-note control: red dot when idle, rounded square and timer while recording. */
export function RecordButton({ recording, elapsed, onStart, onStop }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recording ? onStop : onStart}
        aria-label={recording ? "Stop recording" : "Record"}
        className={cn(
          "flex size-20 items-center justify-center rounded-full border-2 bg-card shadow-md",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
          recording ? "border-destructive" : "border-border",
        )}
      >
        <span
          className={cn(
            "bg-destructive transition-all duration-150",
            recording ? "size-6 rounded-md" : "size-7 rounded-full",
          )}
          aria-hidden
        />
      </button>
      {recording ? (
        <span className="type-numeric text-foreground" role="timer" aria-live="off">
          {formatDuration(elapsed)}
        </span>
      ) : (
        <span className="type-body-sm text-muted-foreground">Tap to record</span>
      )}
    </div>
  );
}
