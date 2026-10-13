export const ANGLES = ["front", "left", "right", "back"] as const;
export type Angle = (typeof ANGLES)[number];

export const ANGLE_LABEL: Record<Angle, string> = {
  front: "Front",
  left: "Left side",
  right: "Right side",
  back: "Back",
};

export type SessionStatus = "capturing" | "processing" | "ready" | "approved" | "abandoned";

export type GenerationStatus = "queued" | "transcribing" | "spec" | "imaging" | "done" | "failed";

/** Structured haircut spec extracted from the customer's request (docs/SPEC.md §6). */
export type HaircutSpec = {
  name: string;
  sides: string;
  top: string;
  back: string;
  neckline: string;
  beard: string;
  notes: string;
  feasibility_warning: string;
};
