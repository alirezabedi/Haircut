import type { HaircutSpec } from "@/lib/types";

// All model prompts live here (docs/SPEC.md §6).

export const SPEC_INSTRUCTIONS = `You turn a barbershop customer's own words into a precise haircut spec for their barber.

You are given the customer's request (transcribed speech or typed text), any later adjustments, and four photos of them: front, left side, right side, back.

Rules:
- Write for a London barber: short, plain British English, practical clipper and scissor terms.
- Use clipper guard numbers with a # when the customer gives them or they are clearly implied (e.g. "#0.5 → #2", "#1"). Lengths on top in centimetres.
- Fill every field. If the customer said nothing about an area, choose what best suits the cut they described and keep it conservative (e.g. "Natural", "Tapered", "Leave as is").
- "beard" is "Leave as is" unless they asked for a beard change.
- "name" is a short name for the cut, e.g. "Skin fade, textured top".
- Adjustments override the earlier request only where they conflict.
- Look at the photos to judge their current hair length, density and hairline. If anything requested isn't possible by cutting their existing hair (more length or density than they have, a lower hairline, a different natural texture), explain it in one or two friendly sentences in "feasibility_warning", addressed to the customer ("Your hair is about 3 cm on top now, so…"). Otherwise leave it as an empty string.
- "notes" holds anything else the barber should know, or an empty string.`;

export type SpecRequest = {
  /** The customer's first request for this session. */
  original: string;
  /** Adjustments from later tries, oldest first (the newest is the one to apply now). */
  adjustments: string[];
  /** The spec of the last successful preview, when adjusting it. */
  previous: HaircutSpec | null;
};

export function buildSpecUserText({ original, adjustments, previous }: SpecRequest): string {
  const parts = [`Customer's request:\n"""${original}"""`];
  if (previous) parts.push(`Spec of the last preview:\n${JSON.stringify(previous, null, 2)}`);
  adjustments.forEach((a, i) => parts.push(`Adjustment ${i + 1}:\n"""${a}"""`));
  parts.push("Photos follow in this order: front, left side, right side, back.");
  return parts.join("\n\n");
}

export function buildImagePrompt(spec: HaircutSpec): string {
  const beardRule =
    /^(leave|keep|no change|as is)/i.test(spec.beard.trim())
      ? "Do not change the beard or stubble at all."
      : `Beard: ${spec.beard}. Change the beard only as described.`;

  return `Edit the first image: it is a photo of a real barbershop customer. The other images show the same person from the left and right sides; use them only as references for their real hair, head shape and hairline.

Give them this haircut:
- Cut: ${spec.name}
- Sides: ${spec.sides}
- Top: ${spec.top}
- Back: ${spec.back}
- Neckline: ${spec.neckline}${spec.notes ? `\n- Notes: ${spec.notes}` : ""}

Keep exactly the same person, face, skin, expression, eyes, ears, clothing, background, camera angle and lighting as the first image. Change only the hair. ${beardRule}

The result must be achievable by cutting this customer's existing hair today: never add length, volume or density, never move or lower the hairline, never change the natural hair colour or texture. Where the cut asks for more than they have, keep their current length there.

Photorealistic, like an unedited phone photo: natural skin, no retouching, no smoothing, no make-up, no filters, no text.`;
}
