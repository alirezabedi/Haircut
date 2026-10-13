import type { Angle } from "@/lib/types";
import { cn } from "@/lib/utils";

// Outlines from docs/design/screens/2-photos.html (front from the CaptureSlot preview).
const PATHS: Record<"front" | "side" | "back", string> = {
  front: "M32 8c-13 0-20 10-20 24 0 9 3 15 7 20l-2 20h30l-2-20c4-5 7-11 7-20C52 18 45 8 32 8z",
  side: "M34 8c-12 0-20 9-20 22 0 5 1 8 3 11l-3 7c-1 2 0 3 2 3h3v6c0 3 2 5 5 5h6v10h20V54c4-5 6-12 6-20 0-15-9-26-22-26z",
  back: "M32 8c-13 0-21 10-21 23 0 9 3 16 8 21v20h26V52c5-5 8-12 8-21C53 18 45 8 32 8z",
};

/** Thin outline of a head from the given angle; colour comes from `currentColor`. */
export function HeadSilhouette({ angle, className }: { angle: Angle; className?: string }) {
  const path = angle === "left" || angle === "right" ? PATHS.side : PATHS[angle];
  return (
    <svg
      viewBox="0 0 64 80"
      width="80"
      height="100"
      className={cn("max-w-[46%]", angle === "right" && "-scale-x-100", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}
