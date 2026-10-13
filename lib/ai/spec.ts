import type OpenAI from "openai";
import { buildSpecUserText, SPEC_INSTRUCTIONS, type SpecRequest } from "@/lib/ai/prompts";
import type { HaircutSpec } from "@/lib/types";

const FIELDS = [
  "name",
  "sides",
  "top",
  "back",
  "neckline",
  "beard",
  "notes",
  "feasibility_warning",
] as const satisfies readonly (keyof HaircutSpec)[];

/** JSON schema for Structured Outputs: every field a required string. */
export const SPEC_SCHEMA = {
  type: "object",
  properties: Object.fromEntries(FIELDS.map((f) => [f, { type: "string" }])),
  required: [...FIELDS],
  additionalProperties: false,
} as const;

/** Validates model output into a HaircutSpec. Throws on anything malformed. */
export function parseSpec(raw: string): HaircutSpec {
  const data = JSON.parse(raw) as Record<string, unknown>;
  if (!data || typeof data !== "object") throw new Error("Spec is not an object");
  const spec = {} as HaircutSpec;
  for (const f of FIELDS) {
    const v = data[f];
    if (typeof v !== "string") throw new Error(`Spec field "${f}" is missing`);
    spec[f] = v.trim();
  }
  if (!spec.name) throw new Error("Spec has no name");
  return spec;
}

export type TextUsage = { input_tokens: number; cached_tokens: number; output_tokens: number };

export type Photos = { front: Buffer; left: Buffer; right: Buffer; back: Buffer };

const dataUrl = (b: Buffer) => `data:image/jpeg;base64,${b.toString("base64")}`;

/** Turns the request (and photos) into a structured spec with OPENAI_TEXT_MODEL. */
export async function extractSpec(
  client: OpenAI,
  modelId: string,
  request: SpecRequest,
  photos: Photos,
): Promise<{ spec: HaircutSpec; usage: TextUsage }> {
  const response = await client.responses.create({
    model: modelId,
    instructions: SPEC_INSTRUCTIONS,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildSpecUserText(request) },
          ...[photos.front, photos.left, photos.right, photos.back].map((p) => ({
            type: "input_image" as const,
            image_url: dataUrl(p),
            detail: "high" as const,
          })),
        ],
      },
    ],
    text: {
      format: { type: "json_schema", name: "haircut_spec", strict: true, schema: SPEC_SCHEMA },
    },
  });

  return {
    spec: parseSpec(response.output_text),
    usage: {
      input_tokens: response.usage?.input_tokens ?? 0,
      cached_tokens: response.usage?.input_tokens_details?.cached_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
    },
  };
}
