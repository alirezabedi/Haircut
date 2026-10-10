import type { Angle } from "@/lib/fake-data";
import { cn } from "@/lib/utils";

const FRONT =
  "M32 8c-13 0-20 10-20 24 0 9 3 15 7 20l-2 20h30l-2-20c4-5 7-11 7-20C52 18 45 8 32 8z";
// Facing left; mirrored for the right side.
const PROFILE =
  "M35 8c-13 0-21 9-21 21 0 3-1 5-3 8l-2 3 4 2v5c0 3 2 5 5 5h4l-1 20h28l-2-20c4-5 7-11 7-20C54 18 46 8 35 8z";

/** Thin outline of a head from the given angle; colour comes from `currentColor`. */
export function HeadSilhouette({ angle, className }: { angle: Angle; className?: string }) {
  const profile = angle === "left" || angle === "right";
  return (
    <svg viewBox="0 0 64 80" className={cn("w-[46%]", className)} aria-hidden>
      <path
        d={profile ? PROFILE : FRONT}
        transform={angle === "right" ? "translate(64 0) scale(-1 1)" : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
