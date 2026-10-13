import Image from "next/image";
import { Check } from "lucide-react";
import { HeadSilhouette } from "@/components/head-silhouette";
import type { Angle } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CaptureState = "empty" | "active" | "done";

type Props = {
  angle: Angle;
  label: string;
  state: CaptureState;
  imageSrc?: string;
  /** Uploading: dims the slot and says so. */
  busy?: boolean;
  onTap: () => void;
  className?: string;
};

/** One of the four photo slots. Tapping opens the camera (or retakes when done). */
export function CaptureSlot({ angle, label, state, imageSrc, busy, onTap, className }: Props) {
  const done = state === "done" && imageSrc;
  return (
    <button
      type="button"
      onClick={onTap}
      aria-busy={busy || undefined}
      aria-label={done ? `${label} photo taken. Tap to retake` : `Take ${label.toLowerCase()} photo`}
      className={cn(
        "relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        state === "empty" && "bg-muted text-muted-foreground",
        state === "active" &&
          "bg-card text-primary-ink shadow-md outline-2 outline-primary focus-visible:outline-primary-ink",
        done && "bg-chart-5",
        className,
      )}
    >
      {done ? (
        <>
          <Image src={imageSrc} alt="" fill sizes="(max-width: 430px) 50vw, 200px" unoptimized className="object-cover" />
          <span className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary">
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          </span>
        </>
      ) : (
        <HeadSilhouette angle={angle} />
      )}
      <span
        className={cn(
          "type-label absolute bottom-2.5 left-2.5",
          done && "text-background [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]",
        )}
      >
        {label}
      </span>
      {busy && (
        <span className="type-body-sm absolute inset-0 flex items-center justify-center bg-card/80 text-foreground">
          Saving…
        </span>
      )}
    </button>
  );
}
